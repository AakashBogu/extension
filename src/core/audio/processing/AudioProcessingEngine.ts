import { AudioProcessor } from './AudioProcessor';
import { AudioProcessingRegistry } from './AudioProcessingRegistry';
import { AudioProcessingConfig, AudioProcessingLifecycleStatus, IAudioProcessingOutput, AudioProcessingMetrics } from './AudioProcessingTypes';
import { TabAudioCaptureManager } from '../capture/TabAudioCaptureManager';
import { OffscreenAudioRuntime } from '../../offscreen/OffscreenAudioRuntime';
import { IEventBus } from '../../events/IEventBus';
import { GlobalStateStore } from '../../state/GlobalStateStore';
import { Logger } from '../../logger/Logger';

export class AudioProcessingEngine {
  public readonly processor: AudioProcessor;
  public readonly registry: AudioProcessingRegistry;
  private status: AudioProcessingLifecycleStatus = 'CREATED';
  private pendingFramesQueue: number = 0;
  private outputHandlers = new Set<IAudioProcessingOutput>();

  constructor(
    private config: AudioProcessingConfig,
    public readonly captureManager?: TabAudioCaptureManager,
    public readonly offscreenRuntime?: OffscreenAudioRuntime,
    private eventBus?: IEventBus,
    private stateStore?: GlobalStateStore,
    logger?: Logger
  ) {
    this.processor = new AudioProcessor(config);
    this.registry = new AudioProcessingRegistry();
    if (logger) {
      logger.debug('AudioProcessingEngine instantiated');
    }
  }

  async initialize(): Promise<void> {
    if (this.status === 'READY' || this.status === 'RUNNING') return; // Idempotent
    this.status = 'INITIALIZING';
    this.status = 'READY';
  }

  async start(): Promise<void> {
    if (this.status === 'RUNNING') return; // Idempotent start
    if (this.status !== 'READY' && this.status !== 'PAUSED') {
      await this.initialize();
    }

    this.status = 'RUNNING';
    if (this.eventBus) this.eventBus.publish('audio.processing_started', { timestamp: Date.now() });
    this.syncState();
  }

  async stop(): Promise<void> {
    if (this.status === 'STOPPED' || this.status === 'DESTROYED') return; // Idempotent stop

    this.status = 'STOPPING';
    this.processor.reset();
    this.pendingFramesQueue = 0;
    this.status = 'STOPPED';

    if (this.eventBus) this.eventBus.publish('audio.processing_stopped', { timestamp: Date.now() });
    this.syncState();
  }

  async pause(): Promise<void> {
    if (this.status === 'RUNNING') {
      this.status = 'PAUSED';
      if (this.eventBus) this.eventBus.publish('audio.processing_paused', { timestamp: Date.now() });
      this.syncState();
    }
  }

  async resume(): Promise<void> {
    if (this.status === 'PAUSED') {
      this.status = 'RUNNING';
      if (this.eventBus) this.eventBus.publish('audio.processing_resumed', { timestamp: Date.now() });
      this.syncState();
    }
  }

  registerOutputHandler(handler: IAudioProcessingOutput): void {
    this.outputHandlers.add(handler);
  }

  unregisterOutputHandler(handler: IAudioProcessingOutput): void {
    this.outputHandlers.delete(handler);
  }

  processAudioData(channelBuffers: Float32Array[], inputSampleRate: number): void {
    if (this.status !== 'RUNNING') return;

    const startTime = Date.now();

    // Backpressure enforcement
    if (this.pendingFramesQueue >= this.config.maxPendingFrames) {
      this.registry.recordDroppedFrame();
      if (this.eventBus) {
        this.eventBus.publish('audio.processing_error', { reason: 'Backpressure limit exceeded' });
      }
      return;
    }

    this.pendingFramesQueue++;

    try {
      const result = this.processor.processChannelData(channelBuffers, inputSampleRate);

      result.frames.forEach(frame => {
        this.registry.recordFrameProcessed(Date.now() - startTime);
        // Publish metadata frame to EventBus (NO RAW PCM)
        if (this.eventBus) {
          this.eventBus.publish('audio.pcm_frame', {
            id: frame.id,
            sequenceNumber: frame.sequenceNumber,
            timestamp: frame.timestamp,
            durationMs: frame.durationMs,
            sampleRate: frame.sampleRate,
            channels: frame.channels,
            sampleLength: frame.samples.length
          });
        }
        this.outputHandlers.forEach(h => h.onFrame(frame));
      });

      result.chunks.forEach(chunk => {
        this.registry.recordChunkProcessed();
        if (this.eventBus) {
          this.eventBus.publish('audio.chunk_ready', {
            id: chunk.id,
            sequenceNumber: chunk.sequenceNumber,
            timestamp: chunk.timestamp,
            durationMs: chunk.durationMs
          });
        }
        this.outputHandlers.forEach(h => h.onChunk(chunk));
      });

      result.segments.forEach(seg => {
        if (seg.endTime) {
          this.registry.recordSpeechSegment(seg.durationMs || 0);
          if (this.eventBus) {
            this.eventBus.publish('audio.speech_ended', seg);
            this.eventBus.publish('audio.speech_segment_ready', seg);
          }
          this.outputHandlers.forEach(h => h.onSpeechSegment(seg));
        } else if (this.eventBus) {
          this.eventBus.publish('audio.speech_started', seg);
        }
      });
    } finally {
      this.pendingFramesQueue = Math.max(0, this.pendingFramesQueue - 1);
    }
  }

  getStatus(): AudioProcessingLifecycleStatus {
    return this.status;
  }

  getMetrics(): AudioProcessingMetrics {
    return this.registry.getMetrics();
  }

  healthCheck(): { healthy: boolean; status: AudioProcessingLifecycleStatus; metrics: AudioProcessingMetrics } {
    const metrics = this.getMetrics();
    const healthy = this.status !== 'DESTROYED' && metrics.droppedFrames < 50;
    return { healthy, status: this.status, metrics };
  }

  destroy(): void {
    this.stop();
    this.outputHandlers.clear();
    this.status = 'DESTROYED';
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
