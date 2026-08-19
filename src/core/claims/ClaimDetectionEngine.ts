import { ClaimDetectionConfig, ClaimDetectionStatus, ClaimCandidate, VerifiableClaim } from './ClaimTypes';
import { SentenceSegmenter } from './extraction/SentenceSegmenter';
import { ClaimExtractor } from './extraction/ClaimExtractor';
import { ClaimCandidateDetector } from './detection/ClaimCandidateDetector';
import { ClaimClassifier } from './classification/ClaimClassifier';
import { ClaimVerifiabilityClassifier } from './classification/ClaimVerifiabilityClassifier';
import { ClaimConfidenceScorer } from './classification/ClaimConfidenceScorer';
import { ClaimPriorityEngine } from './classification/ClaimPriorityEngine';
import { ClaimEntityExtractor } from './entity/ClaimEntityExtractor';
import { ClaimAnalysisProviderRegistry } from './provider/ClaimAnalysisProviderRegistry';
import { ClaimAnalysisProviderRouter } from './provider/ClaimAnalysisProviderRouter';
import { NullClaimAnalysisProvider } from './provider/NullClaimAnalysisProvider';
import { TranscriptWindowManager } from './context/TranscriptWindowManager';
import { ClaimRegistry } from './registry/ClaimRegistry';
import { ClaimDeduplicationManager } from './registry/ClaimDeduplicationManager';
import { ClaimDetectionHealthMonitor } from './health/ClaimDetectionHealthMonitor';
import { ClaimDetectionRecoveryManager } from './recovery/ClaimDetectionRecoveryManager';
import { ClaimDetectionMetricsCollector } from './metrics/ClaimDetectionMetricsCollector';
import { ClaimValidator } from './validation/ClaimValidator';
import { TranscriptSegmentRecord, FinalizedTranscript } from '../speech/transcript/TranscriptTypes';
import { IEventBus } from '../events/IEventBus';
import { GlobalStateStore } from '../state/GlobalStateStore';
import { Logger } from '../logger/Logger';

export class ClaimDetectionEngine {
  public readonly windowManager: TranscriptWindowManager;
  public readonly sentenceSegmenter: SentenceSegmenter;
  public readonly candidateDetector: ClaimCandidateDetector;
  public readonly claimExtractor: ClaimExtractor;
  public readonly classifier: ClaimClassifier;
  public readonly verifiabilityClassifier: ClaimVerifiabilityClassifier;
  public readonly confidenceScorer: ClaimConfidenceScorer;
  public readonly priorityEngine: ClaimPriorityEngine;
  public readonly entityExtractor: ClaimEntityExtractor;
  public readonly providerRegistry: ClaimAnalysisProviderRegistry;
  public readonly providerRouter: ClaimAnalysisProviderRouter;
  public readonly registry: ClaimRegistry;
  public readonly deduplicationManager: ClaimDeduplicationManager;
  public readonly healthMonitor: ClaimDetectionHealthMonitor;
  public readonly recoveryManager: ClaimDetectionRecoveryManager;
  public readonly metricsCollector: ClaimDetectionMetricsCollector;
  public readonly validator: ClaimValidator;

  private status: ClaimDetectionStatus = 'IDLE';

  constructor(
    private config: ClaimDetectionConfig,
    private eventBus?: IEventBus,
    private stateStore?: GlobalStateStore,
    logger?: Logger
  ) {
    this.windowManager = new TranscriptWindowManager();
    this.sentenceSegmenter = new SentenceSegmenter();
    this.candidateDetector = new ClaimCandidateDetector();
    this.claimExtractor = new ClaimExtractor();
    this.classifier = new ClaimClassifier();
    this.verifiabilityClassifier = new ClaimVerifiabilityClassifier();
    this.confidenceScorer = new ClaimConfidenceScorer();
    this.priorityEngine = new ClaimPriorityEngine();
    this.entityExtractor = new ClaimEntityExtractor();
    this.providerRegistry = new ClaimAnalysisProviderRegistry();
    this.providerRegistry.registerProvider(new NullClaimAnalysisProvider());
    this.providerRouter = new ClaimAnalysisProviderRouter(this.providerRegistry);
    this.registry = new ClaimRegistry();
    this.deduplicationManager = new ClaimDeduplicationManager();
    this.healthMonitor = new ClaimDetectionHealthMonitor(eventBus);
    this.recoveryManager = new ClaimDetectionRecoveryManager();
    this.metricsCollector = new ClaimDetectionMetricsCollector();
    this.validator = new ClaimValidator();

    if (logger) {
      logger.debug('ClaimDetectionEngine instantiated');
    }
  }

  async initialize(): Promise<void> {
    if (this.status === 'READY' || this.status === 'RUNNING') return; // Idempotent
    this.status = 'INITIALIZING';
    this.status = 'READY';
    if (this.eventBus) this.eventBus.publish('claim.detection_initialized', { timestamp: Date.now() });
  }

  async start(): Promise<void> {
    if (this.status === 'RUNNING') return; // Idempotent start
    if (this.status !== 'READY' && this.status !== 'PAUSED') {
      await this.initialize();
    }

    this.status = 'RUNNING';
    if (this.eventBus) this.eventBus.publish('claim.detection_started', { timestamp: Date.now() });
    this.syncState();
  }

  async stop(): Promise<void> {
    if (this.status === 'STOPPED' || this.status === 'DESTROYED') return; // Idempotent stop

    this.status = 'STOPPED';
    this.windowManager.clear();
    if (this.eventBus) this.eventBus.publish('claim.detection_stopped', { timestamp: Date.now() });
    this.syncState();
  }

  async pause(): Promise<void> {
    if (this.status === 'RUNNING') {
      this.status = 'PAUSED';
      if (this.eventBus) this.eventBus.publish('claim.detection_paused', { timestamp: Date.now() });
      this.syncState();
    }
  }

  async resume(): Promise<void> {
    if (this.status === 'PAUSED') {
      this.status = 'RUNNING';
      if (this.eventBus) this.eventBus.publish('claim.detection_resumed', { timestamp: Date.now() });
      this.syncState();
    }
  }

  processTranscriptSegment(segment: TranscriptSegmentRecord): ClaimCandidate[] {
    if (this.status !== 'RUNNING') return [];

    this.metricsCollector.recordSegmentProcessed();
    this.windowManager.addSegment(segment);

    const sentences = this.sentenceSegmenter.segmentSentences(segment.text);
    const candidates: ClaimCandidate[] = [];

    sentences.forEach(sentence => {
      const check = this.candidateDetector.isClaimCandidate(sentence);
      if (check.isCandidate) {
        this.metricsCollector.recordCandidateDetected();
        const extracted = this.claimExtractor.extractProposition(sentence);
        const categories = this.classifier.classify(sentence, check.signals);
        const verifiability = this.verifiabilityClassifier.classifyVerifiability(categories, sentence);
        const confidence = this.confidenceScorer.computeConfidence(check.signals.length, verifiability);

        if (confidence >= this.config.minConfidenceThreshold) {
          const priority = this.priorityEngine.computePriority(verifiability, confidence);
          const entities = this.entityExtractor.extractEntities(extracted.normalizedText);

          const candidate: ClaimCandidate = {
            claimId: `clm_${segment.sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            text: extracted.extractedText,
            normalizedText: extracted.normalizedText,
            classification: categories,
            verifiability,
            detectionConfidence: confidence,
            extractionConfidence: 0.9,
            classificationConfidence: 0.85,
            priority,
            status: 'READY_FOR_VERIFICATION',
            entities,
            provenance: {
              transcriptId: segment.segmentId,
              segmentIds: [segment.segmentId],
              sessionId: segment.sessionId,
              startTime: segment.startTime,
              endTime: segment.endTime,
              providerId: segment.providerId,
              createdAt: Date.now()
            },
            occurrenceCount: 1,
            firstSeenAt: Date.now(),
            lastSeenAt: Date.now(),
            createdAt: Date.now()
          };

          const dedupRes = this.deduplicationManager.processCandidate(candidate);
          if (dedupRes.isDuplicate) {
            this.metricsCollector.recordDuplicate();
            if (this.eventBus) this.eventBus.publish('claim.duplicate_detected', dedupRes.canonical);
          } else {
            this.registry.registerClaim(candidate);
            this.metricsCollector.recordClaimExtracted();
            candidates.push(candidate);

            if (this.eventBus) {
              this.eventBus.publish('claim.candidate_detected', candidate);
              this.eventBus.publish('claim.extracted', candidate);
              this.eventBus.publish('claim.ready_for_verification', candidate);
            }
          }
        }
      }
    });

    return candidates;
  }

  processFinalizedTranscript(transcript: FinalizedTranscript): ClaimCandidate[] {
    const allCandidates: ClaimCandidate[] = [];
    transcript.segments.forEach(seg => {
      const candidates = this.processTranscriptSegment(seg);
      allCandidates.push(...candidates);
    });
    return allCandidates;
  }

  getVerifiableClaims(): VerifiableClaim[] {
    return this.registry.getVerifiableClaims();
  }

  getStatus(): ClaimDetectionStatus {
    return this.status;
  }

  getMetrics() {
    return this.metricsCollector.getMetrics();
  }

  async healthCheck() {
    return this.healthMonitor.checkHealth();
  }

  destroy(): void {
    this.stop();
    this.registry.clear();
    this.windowManager.clear();
    this.deduplicationManager.clear();
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
