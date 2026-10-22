import { VerifiableClaim } from '../claims/ClaimTypes';
import {
  VerificationStatus,
  FactCheckVerdict,
  VerificationPipelineConfig,
  VerificationMetrics
} from './VerificationTypes';
import { VerificationRequestSanitizer } from './VerificationRequestSanitizer';
import { VerificationQueue } from './queue/VerificationQueue';
import { VerificationQueryGenerator } from './query/VerificationQueryGenerator';
import { EvidenceFetcher } from './fetcher/EvidenceFetcher';
import { MultiSourceReranker } from './reranker/MultiSourceReranker';
import { StanceAnalyzer } from './stance/StanceAnalyzer';
import { VerdictSynthesizer } from './synthesis/VerdictSynthesizer';
import { VerificationCacheManager } from './cache/VerificationCacheManager';
import { VerificationHealthMonitor } from './health/VerificationHealthMonitor';
import { VerificationRecoveryManager } from './recovery/VerificationRecoveryManager';
import { ProviderExecutionEngine } from '../providers/execution/ProviderExecutionEngine';
import { IEventBus } from '../events/IEventBus';
import { MetricsManager } from '../metrics/MetricsManager';
import { EventTopic } from '../events/EventTypes';
import { VerificationQueueFullError } from '../error/VerificationErrors';

export class VerificationEngine {
  private status: VerificationStatus = 'IDLE';
  private unsubscribers: Array<() => void> = [];

  public readonly sanitizer: VerificationRequestSanitizer;
  public readonly queue: VerificationQueue;
  public readonly queryGenerator: VerificationQueryGenerator;
  public readonly evidenceFetcher: EvidenceFetcher;
  public readonly reranker: MultiSourceReranker;
  public readonly stanceAnalyzer: StanceAnalyzer;
  public readonly verdictSynthesizer: VerdictSynthesizer;
  public readonly cacheManager: VerificationCacheManager;
  public readonly healthMonitor: VerificationHealthMonitor;
  public readonly recoveryManager: VerificationRecoveryManager;

  private readonly config: VerificationPipelineConfig;

  constructor(
    public readonly executionEngine: ProviderExecutionEngine,
    config?: Partial<VerificationPipelineConfig>,
    private readonly eventBus?: IEventBus,
    metricsManager?: MetricsManager
  ) {
    this.config = {
      enabled: config?.enabled ?? true,
      boundedCapacity: config?.boundedCapacity ?? 50,
      concurrencyLimit: config?.concurrencyLimit ?? 3,
      maxQueriesPerClaim: config?.maxQueriesPerClaim ?? 3,
      maxResultsPerQuery: config?.maxResultsPerQuery ?? 5,
      maxRankedEvidence: config?.maxRankedEvidence ?? 10,
      minCredibilityThreshold: config?.minCredibilityThreshold ?? 0.3,
      staleTaskTtlMs: config?.staleTaskTtlMs ?? 30000,
      taskTimeoutMs: config?.taskTimeoutMs ?? 15000,
      cacheTtlMs: config?.cacheTtlMs ?? 3600000,
      maxCacheSize: config?.maxCacheSize ?? 200,
      weights: {
        relevance: config?.weights?.relevance ?? 0.40,
        credibility: config?.weights?.credibility ?? 0.35,
        freshness: config?.weights?.freshness ?? 0.25
      }
    };

    this.sanitizer = new VerificationRequestSanitizer();
    this.queue = new VerificationQueue({
      capacity: this.config.boundedCapacity,
      concurrencyLimit: this.config.concurrencyLimit,
      staleTaskTtlMs: this.config.staleTaskTtlMs,
      defaultTaskTimeoutMs: this.config.taskTimeoutMs
    }, eventBus);

    this.queryGenerator = new VerificationQueryGenerator(executionEngine, this.sanitizer);
    this.evidenceFetcher = new EvidenceFetcher(executionEngine, this.sanitizer);
    this.reranker = new MultiSourceReranker({
      relevanceWeight: this.config.weights.relevance,
      credibilityWeight: this.config.weights.credibility,
      freshnessWeight: this.config.weights.freshness,
      minCredibilityThreshold: this.config.minCredibilityThreshold,
      maxRankedItems: this.config.maxRankedEvidence
    });

    this.stanceAnalyzer = new StanceAnalyzer(executionEngine, this.sanitizer);
    this.verdictSynthesizer = new VerdictSynthesizer(executionEngine, this.sanitizer);

    this.cacheManager = new VerificationCacheManager(
      this.config.maxCacheSize,
      this.config.cacheTtlMs,
      eventBus
    );

    this.healthMonitor = new VerificationHealthMonitor(metricsManager, eventBus);
    this.recoveryManager = new VerificationRecoveryManager(
      this.queryGenerator,
      this.stanceAnalyzer,
      this.verdictSynthesizer,
      eventBus
    );
  }

  public async initialize(): Promise<void> {
    if (this.status !== 'IDLE' && this.status !== 'STOPPED') return;
    this.status = 'INITIALIZING';

    if (this.eventBus) {
      const unsub = this.eventBus.subscribe('claim.ready_for_verification' as EventTopic, async (event) => {
        if (this.status === 'RUNNING' && event.payload) {
          try {
            await this.verifyClaim(event.payload as VerifiableClaim);
          } catch {
            // Error handled inside verifyClaim pipeline
          }
        }
      });
      this.unsubscribers.push(unsub);
    }

    this.status = 'READY';
  }

  public start(): void {
    if (this.status === 'READY' || this.status === 'PAUSED') {
      this.status = 'RUNNING';
    }
  }

  public pause(): void {
    if (this.status === 'RUNNING') {
      this.status = 'PAUSED';
    }
  }

  public resume(): void {
    if (this.status === 'PAUSED') {
      this.status = 'RUNNING';
    }
  }

  /**
   * Main verification entry point. Accepts a VerifiableClaim and runs full verification pipeline.
   */
  public async verifyClaim(claim: VerifiableClaim): Promise<FactCheckVerdict> {
    const startTime = Date.now();
    this.healthMonitor.recordStarted();

    // 1. Check Cache
    const cachedVerdict = this.cacheManager.get(claim.claimId) || this.cacheManager.get(claim.normalizedText);
    if (cachedVerdict) {
      this.healthMonitor.recordCompleted(Date.now() - startTime, cachedVerdict.verdict);
      return cachedVerdict;
    }

    // 2. Check In-Flight Deduplication
    const dedupKey = claim.normalizedText || claim.text;
    const activeInFlight = this.cacheManager.getInFlight(dedupKey);
    if (activeInFlight) {
      return activeInFlight;
    }

    const verificationPromise = (async (): Promise<FactCheckVerdict> => {
      // 3. Privacy Sanitization Boundary
      const sanitized = this.sanitizer.sanitizeClaim(claim);
      const priorityNum = claim.priority === 'CRITICAL' ? 4 : claim.priority === 'HIGH' ? 3 : claim.priority === 'LOW' ? 1 : 2;

      // 4. Enqueue & Execute Task in Bounded Queue (REJECT_NEW backpressure, concurrencyLimit enforcement)
      try {
        return await this.queue.execute(
          sanitized,
          priorityNum,
          this.config.taskTimeoutMs,
          async (currentTask) => {
            if (this.eventBus) {
              this.eventBus.publish('verification.started' as EventTopic, {
                claimId: sanitized.claimId,
                taskId: currentTask.taskId,
                timestamp: Date.now()
              });
            }

            try {
              // 5. Query Generation (AI + Fallback)
              let queries;
              try {
                queries = await this.queryGenerator.generateQueries(
                  sanitized,
                  undefined,
                  currentTask.abortController.signal
                );
              } catch (err) {
                queries = this.recoveryManager.recoverQueryGeneration(sanitized, err);
              }

              if (this.eventBus) {
                this.eventBus.publish('verification.query_generated' as EventTopic, {
                  claimId: sanitized.claimId,
                  queriesCount: queries.length,
                  timestamp: Date.now()
                });
              }

              // 6. Evidence Fetching (via ProviderExecutionEngine Search)
              const rawEvidence = await this.evidenceFetcher.fetchEvidence(
                queries,
                this.config.maxResultsPerQuery,
                undefined,
                currentTask.abortController.signal
              );

              if (this.eventBus) {
                this.eventBus.publish('verification.evidence_fetched' as EventTopic, {
                  claimId: sanitized.claimId,
                  evidenceCount: rawEvidence.length,
                  timestamp: Date.now()
                });
              }

              // 7. Deterministic Reranking
              const reranked = this.reranker.rerank(rawEvidence, sanitized);

              if (this.eventBus) {
                this.eventBus.publish('verification.reranked' as EventTopic, {
                  claimId: sanitized.claimId,
                  rankedCount: reranked.length,
                  timestamp: Date.now()
                });
              }

              // 8. Stance Analysis (AI + Fallback)
              let stanceAnalyses;
              try {
                stanceAnalyses = await this.stanceAnalyzer.analyzeStances(
                  reranked,
                  sanitized,
                  undefined,
                  currentTask.abortController.signal
                );
              } catch (err) {
                stanceAnalyses = reranked.map(item => this.recoveryManager.recoverStanceAnalysis(item, sanitized, err));
              }

              // 9. Verdict Synthesis (AI + Fallback)
              let verdict;
              try {
                verdict = await this.verdictSynthesizer.synthesizeVerdict(
                  sanitized,
                  reranked,
                  stanceAnalyses,
                  startTime,
                  undefined,
                  currentTask.abortController.signal
                );
              } catch (err) {
                verdict = this.recoveryManager.recoverVerdictSynthesis(sanitized, reranked, stanceAnalyses, startTime, err);
              }

              if (this.eventBus) {
                this.eventBus.publish('verification.verdict_synthesized' as EventTopic, {
                  claimId: sanitized.claimId,
                  verdict: verdict.verdict,
                  confidence: verdict.confidenceScore,
                  timestamp: Date.now()
                });
              }

              // 10. Cache Verdict
              this.cacheManager.set(sanitized.claimId, verdict);
              this.cacheManager.set(sanitized.normalizedText, verdict);

              const durationMs = Date.now() - startTime;
              this.healthMonitor.recordCompleted(durationMs, verdict.verdict);

              if (this.eventBus) {
                this.eventBus.publish('verdict.ready' as EventTopic, {
                  verdict,
                  claimId: sanitized.claimId,
                  timestamp: Date.now()
                });
              }

              return verdict;
            } catch (err) {
              this.healthMonitor.recordFailed();

              if (this.eventBus) {
                this.eventBus.publish('verification.failed' as EventTopic, {
                  claimId: sanitized.claimId,
                  taskId: currentTask.taskId,
                  error: err instanceof Error ? err.message : String(err),
                  timestamp: Date.now()
                });
              }
              throw err;
            }
          }
        );
      } catch (err) {
        if (err instanceof VerificationQueueFullError) {
          this.healthMonitor.recordRejected();
        }
        throw err;
      }
    })();

    this.cacheManager.setInFlight(dedupKey, verificationPromise);
    return verificationPromise;
  }

  public getStatus(): VerificationStatus {
    return this.status;
  }

  public getMetrics(): VerificationMetrics {
    return this.healthMonitor.getMetrics(
      this.queue.size(),
      this.config.boundedCapacity,
      this.cacheManager.getHitRate()
    );
  }

  public async stop(): Promise<void> {
    this.status = 'STOPPING';
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
    await this.queue.drain();
    this.status = 'STOPPED';
  }

  public destroy(): void {
    this.status = 'DESTROYED';
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
    this.queue.shutdown();
    this.cacheManager.clear();
    this.healthMonitor.reset();
  }
}
