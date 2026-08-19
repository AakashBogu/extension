import { AudioChunkQueue } from './AudioChunkQueue';
import { AudioChunkTransport } from './AudioChunkTransport';
import { AudioChunkSerializer } from './AudioChunkSerializer';
import { AudioTransportRouter } from './AudioTransportRouter';
import { SpeechPipelineBoundary, NullSpeechPipelineAdapter } from './SpeechPipelineBoundary';
import { AudioTransportHealthMonitor } from './AudioTransportHealthMonitor';
import { AudioTransportRecoveryManager } from './AudioTransportRecoveryManager';
import { AudioTransportConfig, AudioTransportStatus, AudioTransportMetrics, ISpeechPipelineAdapter } from './AudioTransportTypes';
import { AudioChunk, AudioFrame, IAudioProcessingOutput, SpeechSegment } from '../processing/AudioProcessingTypes';
import { IEventBus } from '../../events/IEventBus';
import { GlobalStateStore } from '../../state/GlobalStateStore';
import { Logger } from '../../logger/Logger';

export class AudioTransportEngine implements IAudioProcessingOutput {
  public readonly queue: AudioChunkQueue;
  public readonly transport: AudioChunkTransport;
  public readonly serializer: AudioChunkSerializer;
  public readonly router: AudioTransportRouter;
  public readonly boundary: SpeechPipelineBoundary;
  public readonly healthMonitor: AudioTransportHealthMonitor;
  public readonly recoveryManager: AudioTransportRecoveryManager;

  private status: AudioTransportStatus = 'IDLE';
  private metrics: AudioTransportMetrics = {
    receivedChunks: 0,
    queuedChunks: 0,
    deliveredChunks: 0,
    droppedChunks: 0,
    rejectedChunks: 0,
    sequenceGaps: 0,
    duplicates: 0,
    outOfOrder: 0,
    averageQueueDepth: 0,
    maxQueueDepth: 0,
    averageDeliveryLatencyMs: 0,
    maxDeliveryLatencyMs: 0,
    retryCount: 0,
    adapterFailures: 0
  };

  constructor(
    private config: AudioTransportConfig,
    adapter: ISpeechPipelineAdapter = new NullSpeechPipelineAdapter(),
    private eventBus?: IEventBus,
    private stateStore?: GlobalStateStore,
    logger?: Logger
  ) {
    this.queue = new AudioChunkQueue(config.maxQueueSize, config.dropStrategy);
    this.transport = new AudioChunkTransport();
    this.serializer = new AudioChunkSerializer();
    this.router = new AudioTransportRouter();
    this.boundary = new SpeechPipelineBoundary(adapter);
    this.healthMonitor = new AudioTransportHealthMonitor(this.queue, this.boundary, eventBus);
    this.recoveryManager = new AudioTransportRecoveryManager(this.boundary, config.retry.maxRetries, config.retry.retryDelayMs, eventBus);

    if (logger) {
      logger.debug('AudioTransportEngine initialized');
    }
  }

  async initialize(): Promise<void> {
    if (this.status === 'READY' || this.status === 'RUNNING') return; // Idempotent
    this.status = 'INITIALIZING';
    await this.boundary.initialize();
    this.status = 'READY';
    if (this.eventBus) this.eventBus.publish('audio.transport_initialized', { timestamp: Date.now() });
  }

  async start(): Promise<void> {
    if (this.status === 'RUNNING') return; // Idempotent start
    if (this.status !== 'READY' && this.status !== 'PAUSED') {
      await this.initialize();
    }

    this.status = 'RUNNING';
    await this.boundary.resume();
    if (this.eventBus) this.eventBus.publish('audio.transport_started', { timestamp: Date.now() });
    this.syncState();
  }

  async stop(): Promise<void> {
    if (this.status === 'STOPPED' || this.status === 'DESTROYED') return; // Idempotent stop

    this.status = 'STOPPED';
    await this.boundary.stop();
    this.queue.clear();
    this.transport.resetSequence();

    if (this.eventBus) this.eventBus.publish('audio.transport_stopped', { timestamp: Date.now() });
    this.syncState();
  }

  async pause(): Promise<void> {
    if (this.status === 'RUNNING') {
      this.status = 'PAUSED';
      await this.boundary.pause();
      if (this.eventBus) this.eventBus.publish('audio.transport_paused', { timestamp: Date.now() });
      this.syncState();
    }
  }

  async resume(): Promise<void> {
    if (this.status === 'PAUSED') {
      this.status = 'RUNNING';
      await this.boundary.resume();
      if (this.eventBus) this.eventBus.publish('audio.transport_resumed', { timestamp: Date.now() });
      this.syncState();
    }
  }

  async drain(): Promise<void> {
    this.status = 'DRAINING';
    if (this.eventBus) this.eventBus.publish('audio.transport_draining', { queueSize: this.queue.size() });

    while (!this.queue.isEmpty()) {
      const chunk = this.queue.dequeue();
      if (chunk) {
        await this.deliverChunk(chunk);
      }
    }
    this.status = 'READY';
  }

  onFrame(_frame: AudioFrame): void {
    // Frames passed through to speech boundary if required
  }

  onChunk(chunk: AudioChunk): void {
    if (this.status !== 'RUNNING' && this.status !== 'DRAINING') return;

    this.metrics.receivedChunks++;
    if (this.eventBus) {
      this.eventBus.publish('audio.transport_chunk_received', {
        id: chunk.id,
        sequenceNumber: chunk.sequenceNumber,
        timestamp: chunk.timestamp
      });
    }

    try {
      this.transport.validateChunk(chunk);
      const seqCheck = this.transport.processSequenceNumber(chunk.sequenceNumber);

      if (seqCheck.isDuplicate) {
        this.metrics.duplicates++;
        if (this.eventBus) this.eventBus.publish('audio.transport_duplicate_chunk', { sequenceNumber: chunk.sequenceNumber });
        return;
      }

      if (seqCheck.isGap) {
        this.metrics.sequenceGaps++;
        if (this.eventBus) this.eventBus.publish('audio.transport_sequence_gap', { sequenceNumber: chunk.sequenceNumber });
      }

      // Check queue saturation backpressure
      if (this.queue.getMetrics().utilizationPercent >= this.config.backpressureThresholdPercent) {
        if (this.eventBus) {
          this.eventBus.publish('audio.transport_backpressure', {
            queueDepth: this.queue.size(),
            capacity: this.config.maxQueueSize,
            utilizationPercent: this.queue.getMetrics().utilizationPercent,
            dropStrategy: this.config.dropStrategy
          });
        }
      }

      const enqueued = this.queue.enqueue(chunk);
      if (enqueued) {
        this.metrics.queuedChunks++;
        this.metrics.maxQueueDepth = Math.max(this.metrics.maxQueueDepth, this.queue.size());
        if (this.eventBus) {
          this.eventBus.publish('audio.transport_chunk_queued', {
            id: chunk.id,
            sequenceNumber: chunk.sequenceNumber,
            queueSize: this.queue.size()
          });
        }

        // Deliver immediately to boundary
        const nextChunk = this.queue.dequeue();
        if (nextChunk) {
          this.deliverChunk(nextChunk).catch((err: unknown) => {
            this.metrics.adapterFailures++;
            if (this.eventBus) this.eventBus.publish('audio.transport_error', { error: String(err) });
          });
        }
      } else {
        this.metrics.droppedChunks++;
        if (this.eventBus) this.eventBus.publish('audio.transport_chunk_dropped', { id: chunk.id });
      }
    } catch (err) {
      this.metrics.rejectedChunks++;
      if (this.eventBus) this.eventBus.publish('audio.transport_chunk_rejected', { id: chunk.id, error: String(err) });
    }
  }

  onSpeechSegment(segment: SpeechSegment): void {
    if (this.status !== 'RUNNING') return;
    this.boundary.acceptSpeechSegment(segment).catch(() => {});
  }

  getStatus(): AudioTransportStatus {
    return this.status;
  }

  getMetrics(): AudioTransportMetrics {
    const qMetrics = this.queue.getMetrics();
    return {
      ...this.metrics,
      averageQueueDepth: qMetrics.size,
      droppedChunks: qMetrics.droppedChunks,
      rejectedChunks: qMetrics.rejectedChunks
    };
  }

  async healthCheck() {
    return this.healthMonitor.checkHealth();
  }

  destroy(): void {
    this.stop();
    this.queue.destroy();
    this.boundary.destroy();
    this.status = 'DESTROYED';
  }

  private async deliverChunk(chunk: AudioChunk): Promise<void> {
    const startTime = Date.now();
    await this.boundary.acceptAudioChunk(chunk);
    this.metrics.deliveredChunks++;
    const latency = Date.now() - startTime;
    this.metrics.maxDeliveryLatencyMs = Math.max(this.metrics.maxDeliveryLatencyMs, latency);
    this.metrics.averageDeliveryLatencyMs =
      (this.metrics.averageDeliveryLatencyMs * (this.metrics.deliveredChunks - 1) + latency) /
      this.metrics.deliveredChunks;

    if (this.eventBus) {
      this.eventBus.publish('audio.transport_chunk_delivered', {
        id: chunk.id,
        sequenceNumber: chunk.sequenceNumber,
        latencyMs: latency
      });
    }
  }

  private syncState(): void {
    if (this.stateStore) {
      this.stateStore.setState({
        runtime: {
          version: '1.0.0',
          env: 'production',
          isRunning: this.status === 'RUNNING',
          startedAt: Date.now()
        }
      });
    }
  }
}
