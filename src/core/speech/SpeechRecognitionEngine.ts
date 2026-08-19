import { ISpeechPipelineAdapter, SpeechPipelineHealth } from '../audio/transport/AudioTransportTypes';
import { AudioChunk, SpeechSegment } from '../audio/processing/AudioProcessingTypes';
import { SpeechProviderRegistry } from './provider/SpeechProviderRegistry';
import { SpeechProviderRouter } from './provider/SpeechProviderRouter';
import { NullSpeechRecognitionProvider } from './provider/NullSpeechRecognitionProvider';
import { RecognitionSessionManager } from './session/RecognitionSessionManager';
import { TranscriptAggregator } from './transcript/TranscriptAggregator';
import { SpeechLanguageManager } from './language/SpeechLanguageManager';
import { ConfidenceNormalizer } from './confidence/ConfidenceNormalizer';
import { SpeechRecognitionHealthMonitor } from './health/SpeechRecognitionHealthMonitor';
import { SpeechRecognitionRecoveryManager } from './recovery/SpeechRecognitionRecoveryManager';
import { SpeechRecognitionMetricsCollector } from './metrics/SpeechRecognitionMetricsCollector';
import { SpeechRecognitionValidator } from './validation/SpeechRecognitionValidator';
import { SpeechRecognitionConfig, SpeechRecognitionEngineStatus } from './SpeechRecognitionTypes';
import { FinalizedTranscript, RecognitionResult } from './transcript/TranscriptTypes';
import { IEventBus } from '../events/IEventBus';
import { GlobalStateStore } from '../state/GlobalStateStore';
import { Logger } from '../logger/Logger';

export class SpeechRecognitionEngine implements ISpeechPipelineAdapter {
  public readonly name = 'SpeechRecognitionEngine';
  public readonly providerRegistry: SpeechProviderRegistry;
  public readonly providerRouter: SpeechProviderRouter;
  public readonly sessionManager: RecognitionSessionManager;
  public readonly aggregator: TranscriptAggregator;
  public readonly languageManager: SpeechLanguageManager;
  public readonly confidenceNormalizer: ConfidenceNormalizer;
  public readonly healthMonitor: SpeechRecognitionHealthMonitor;
  public readonly recoveryManager: SpeechRecognitionRecoveryManager;
  public readonly metricsCollector: SpeechRecognitionMetricsCollector;
  public readonly validator: SpeechRecognitionValidator;

  private status: SpeechRecognitionEngineStatus = 'IDLE';

  constructor(
    private config: SpeechRecognitionConfig,
    private eventBus?: IEventBus,
    private stateStore?: GlobalStateStore,
    logger?: Logger
  ) {
    this.providerRegistry = new SpeechProviderRegistry();
    this.providerRegistry.registerProvider(new NullSpeechRecognitionProvider());
    this.providerRouter = new SpeechProviderRouter(this.providerRegistry);
    this.sessionManager = new RecognitionSessionManager();
    this.aggregator = new TranscriptAggregator();
    this.languageManager = new SpeechLanguageManager();
    this.confidenceNormalizer = new ConfidenceNormalizer();
    this.healthMonitor = new SpeechRecognitionHealthMonitor(this.sessionManager, this.providerRouter, eventBus);
    this.recoveryManager = new SpeechRecognitionRecoveryManager(this.providerRouter, 3, 500, eventBus);
    this.metricsCollector = new SpeechRecognitionMetricsCollector();
    this.validator = new SpeechRecognitionValidator();

    if (logger) {
      logger.debug('SpeechRecognitionEngine instantiated');
    }
  }

  async initialize(): Promise<void> {
    if (this.status === 'READY' || this.status === 'LISTENING') return; // Idempotent
    this.status = 'INITIALIZING';
    const providers = this.providerRegistry.listProviders();
    for (const p of providers) {
      await p.initialize();
    }
    this.status = 'READY';
    if (this.eventBus) this.eventBus.publish('speech.recognition_initialized', { timestamp: Date.now() });
  }

  async startSession(tabId: number, videoId?: string, language: string = 'en-US'): Promise<string> {
    if (this.status !== 'READY' && this.status !== 'PAUSED') {
      await this.initialize();
    }

    const provider = this.providerRouter.selectProvider(this.config.providerPreference[0], language);
    const session = this.sessionManager.createSession(tabId, provider.id, language, videoId);
    this.sessionManager.updateSessionStatus(session.sessionId, 'ACTIVE');

    await provider.startSession(session.sessionId, language, (result: RecognitionResult) => {
      this.handleRecognitionResult(result);
    });

    this.status = 'LISTENING';
    if (this.eventBus) this.eventBus.publish('speech.recognition_started', session);
    this.syncState();

    return session.sessionId;
  }

  async acceptAudioChunk(chunk: AudioChunk): Promise<void> {
    if (this.status !== 'LISTENING' && this.status !== 'PROCESSING') return;

    this.metricsCollector.recordChunkProcessed();
    const activeSession = this.sessionManager.getActiveSession();
    if (!activeSession) return;

    const provider = this.providerRegistry.getProvider(activeSession.providerId);
    if (provider) {
      await provider.acceptAudioChunk(chunk);
    }
  }

  async acceptSpeechSegment(segment: SpeechSegment): Promise<void> {
    if (this.status !== 'LISTENING' && this.status !== 'PROCESSING') return;
    const activeSession = this.sessionManager.getActiveSession();
    if (!activeSession) return;

    const provider = this.providerRegistry.getProvider(activeSession.providerId);
    if (provider) {
      await provider.acceptSpeechSegment(segment);
    }
  }

  async flush(): Promise<void> {
    this.status = 'FLUSHING';
    const activeSession = this.sessionManager.getActiveSession();
    if (activeSession) {
      const provider = this.providerRegistry.getProvider(activeSession.providerId);
      if (provider) await provider.flush();
    }
    this.status = 'READY';
  }

  async pause(): Promise<void> {
    if (this.status === 'LISTENING') {
      this.status = 'PAUSED';
      if (this.eventBus) this.eventBus.publish('speech.recognition_paused', { timestamp: Date.now() });
      this.syncState();
    }
  }

  async resume(): Promise<void> {
    if (this.status === 'PAUSED') {
      this.status = 'LISTENING';
      if (this.eventBus) this.eventBus.publish('speech.recognition_resumed', { timestamp: Date.now() });
      this.syncState();
    }
  }

  async stop(): Promise<void> {
    await this.stopSession();
  }

  async stopSession(): Promise<void> {
    const activeSession = this.sessionManager.getActiveSession();
    if (!activeSession || activeSession.status === 'STOPPED') return;

    this.status = 'STOPPING';
    const provider = this.providerRegistry.getProvider(activeSession.providerId);
    if (provider) {
      await provider.stopSession(activeSession.sessionId);
    }

    this.sessionManager.closeSession(activeSession.sessionId);
    this.status = 'STOPPED';

    if (this.eventBus) this.eventBus.publish('speech.recognition_stopped', { sessionId: activeSession.sessionId });
    this.syncState();
  }

  getFinalizedTranscript(): FinalizedTranscript | null {
    const activeSession = this.sessionManager.getActiveSession();
    if (!activeSession) return null;

    return this.aggregator.buildFinalizedTranscript(
      activeSession.sessionId,
      activeSession.providerId,
      activeSession.language,
      activeSession.videoId
    );
  }

  getStatus(): SpeechRecognitionEngineStatus {
    return this.status;
  }

  getMetrics() {
    return this.metricsCollector.getMetrics();
  }

  async healthCheck(): Promise<SpeechPipelineHealth> {
    const health = await this.healthMonitor.checkHealth();
    return {
      ready: health.status === 'HEALTHY',
      adapterName: this.name,
      processedChunksCount: this.metricsCollector.getMetrics().audioChunksProcessed,
      lastProcessedAt: Date.now()
    };
  }

  destroy(): void {
    this.stopSession();
    this.providerRegistry.clear();
    this.sessionManager.clear();
    this.aggregator.reset();
    this.status = 'DESTROYED';
  }

  private handleRecognitionResult(result: RecognitionResult): void {
    try {
      this.validator.validateResult(result);
      result.confidence = this.confidenceNormalizer.normalize(result.confidence);
      this.metricsCollector.recordResultReceived(result.isFinal, result.confidence);

      if (!result.isFinal) {
        this.aggregator.processResult(result);
        if (this.eventBus) this.eventBus.publish('speech.partial_result', result);
      } else {
        const segment = this.aggregator.processResult(result);
        if (segment && this.eventBus) {
          this.eventBus.publish('speech.final_result', result);
          this.eventBus.publish('speech.segment_finalized', segment);
          this.eventBus.publish('speech.transcript_updated', this.getFinalizedTranscript());
        }
      }
    } catch (err) {
      if (this.eventBus) this.eventBus.publish('speech.recognition_error', { error: String(err) });
    }
  }

  private syncState(): void {
    if (this.stateStore) {
      const activeSession = this.sessionManager.getActiveSession();
      this.stateStore.setState({
        runtime: {
          version: '1.0.0',
          env: 'production',
          isRunning: this.status === 'LISTENING',
          startedAt: activeSession ? activeSession.startedAt : Date.now()
        }
      });
    }
  }
}
