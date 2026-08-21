import { AIProviderRouter } from '../router/AIProviderRouter';
import { SearchProviderRouter } from '../router/SearchProviderRouter';
import { AIProviderRegistry } from '../registry/AIProviderRegistry';
import { SearchProviderRegistry } from '../registry/SearchProviderRegistry';
import { ProviderHealthManager } from '../health/ProviderHealthManager';
import { ProviderExecutionPolicy, ExecutionPolicyConfig } from './ProviderExecutionPolicy';
import { RequestLifecycleManager } from './RequestLifecycleManager';
import { ProviderRetryManager } from './ProviderRetryManager';
import { ProviderRequestCancellationManager } from './ProviderRequestCancellationManager';
import { ProviderResponseNormalizer } from './ProviderResponseNormalizer';
import { ProviderExecutionMetricsCollector } from './ProviderExecutionMetricsCollector';
import { ProviderExecutionHealthMonitor } from './ProviderExecutionHealthMonitor';
import { ProviderExecutionRecoveryManager } from './ProviderExecutionRecoveryManager';
import { ExecutionEngineStatus, ProviderRequestStatus, ProviderExecutionMetrics, ProviderExecutionHealth } from './ProviderExecutionTypes';
import { AIRequest, AIResponse } from '../ai/AIProviderTypes';
import { SearchRequest, SearchResponse } from '../search/SearchProviderTypes';
import { ProviderConcurrencyError, ProviderRequestValidationError, ProviderFallbackExhaustedError } from '../../error/ProviderExecutionErrors';
import { ProviderResponseCache } from '../cache/ProviderResponseCache';
import { ProviderInFlightDeduplicator } from '../cache/ProviderInFlightDeduplicator';
import { ProviderCacheKeyGenerator } from '../cache/ProviderCacheKeyGenerator';
import { ProviderUsageTracker } from '../limits/ProviderUsageTracker';
import { ProviderRateLimitStateTracker } from '../limits/ProviderRateLimitStateTracker';
import { ProviderAdmissionController } from '../limits/ProviderAdmissionController';
import { ProviderCooldownManager } from '../limits/ProviderCooldownManager';
import { ProviderAdmissionError } from '../../error/ProviderLimitErrors';
import { IEventBus } from '../../events/IEventBus';

export class ProviderExecutionEngine {
  private status: ExecutionEngineStatus = 'IDLE';

  public readonly policy: ProviderExecutionPolicy;
  public readonly lifecycleManager: RequestLifecycleManager;
  public readonly retryManager: ProviderRetryManager;
  public readonly cancellationManager: ProviderRequestCancellationManager;
  public readonly metricsCollector: ProviderExecutionMetricsCollector;
  public readonly healthMonitor: ProviderExecutionHealthMonitor;
  public readonly recoveryManager: ProviderExecutionRecoveryManager;
  public readonly responseCache: ProviderResponseCache;
  public readonly deduplicator: ProviderInFlightDeduplicator;
  public readonly usageTracker: ProviderUsageTracker;
  public readonly rateLimitTracker: ProviderRateLimitStateTracker;
  public readonly cooldownManager: ProviderCooldownManager;
  public readonly admissionController: ProviderAdmissionController;

  constructor(
    public readonly aiRouter: AIProviderRouter,
    public readonly searchRouter: SearchProviderRouter,
    public readonly aiRegistry: AIProviderRegistry,
    public readonly searchRegistry: SearchProviderRegistry,
    public readonly healthManager: ProviderHealthManager,
    policyConfig?: ProviderExecutionPolicy | ExecutionPolicyConfig,
    responseCache?: ProviderResponseCache,
    usageTracker?: ProviderUsageTracker,
    rateLimitTracker?: ProviderRateLimitStateTracker,
    admissionController?: ProviderAdmissionController,
    cooldownManager?: ProviderCooldownManager,
    private eventBus?: IEventBus
  ) {
    this.policy = policyConfig instanceof ProviderExecutionPolicy ? policyConfig : new ProviderExecutionPolicy(policyConfig);
    this.lifecycleManager = new RequestLifecycleManager(this.policy.requestRetentionLimit, eventBus);
    this.retryManager = new ProviderRetryManager(this.policy.maxRetryAttempts, this.policy.initialRetryDelayMs, this.policy.maxRetryDelayMs);
    this.cancellationManager = new ProviderRequestCancellationManager(eventBus);
    this.metricsCollector = new ProviderExecutionMetricsCollector();
    this.healthMonitor = new ProviderExecutionHealthMonitor(healthManager, this.metricsCollector, eventBus);
    this.recoveryManager = new ProviderExecutionRecoveryManager(this.lifecycleManager, this.cancellationManager, this.metricsCollector, eventBus);
    this.responseCache = responseCache || new ProviderResponseCache(undefined, undefined, eventBus);
    this.deduplicator = new ProviderInFlightDeduplicator(this.responseCache.metricsCollector, eventBus);
    this.usageTracker = usageTracker || new ProviderUsageTracker(eventBus);
    this.rateLimitTracker = rateLimitTracker || new ProviderRateLimitStateTracker(this.usageTracker, eventBus);
    this.cooldownManager = cooldownManager || new ProviderCooldownManager(undefined, eventBus);
    this.admissionController = admissionController || new ProviderAdmissionController(this.rateLimitTracker, this.usageTracker, undefined, this.cooldownManager, eventBus);
  }

  async initialize(): Promise<void> {
    this.status = 'INITIALIZING';
    await this.cooldownManager.initialize();
    await this.admissionController.initialize();
    if (this.eventBus) {
      this.eventBus.publish('provider.execution_initialized', { timestamp: Date.now() });
    }
    this.status = 'READY';
  }

  async executeAI(request: AIRequest): Promise<AIResponse> {
    if (!request || !request.requestId || !request.operation) {
      throw new ProviderRequestValidationError('Invalid AI request object or missing requestId/operation');
    }

    const cacheKey = ProviderCacheKeyGenerator.generateAIKey(request);

    // 1. Check Cache Hit
    const cached = this.responseCache.get<AIResponse>(cacheKey);
    if (cached) {
      return {
        ...cached,
        requestId: request.requestId,
        correlationId: request.correlationId
      };
    }

    // 2. In-Flight Deduplication & Execution
    return this.deduplicator.execute(cacheKey, async () => {
      this.checkConcurrency();
      const timeoutMs = request.timeoutMs || this.policy.defaultAiTimeoutMs;
      this.lifecycleManager.createRecord(request.requestId, 'AI', timeoutMs);
      this.metricsCollector.recordRequestCreated();
      this.cancellationManager.createController(request.requestId);

      const startTime = Date.now();
      let attemptCount = 0;
      let fallbackCount = 0;
      const excludedProviders = new Set<string>();
      let executionActive = true;

      while (executionActive) {
        this.cancellationManager.checkCancelled(request.requestId);
        attemptCount++;

        let provider;
        try {
          this.lifecycleManager.transitionTo(request.requestId, 'ROUTING');
          provider = this.aiRouter.selectProvider(request);

          if (excludedProviders.has(provider.id)) {
            const candidates = this.aiRegistry.getEnabled().filter(p => p.capabilities.operations.includes(request.operation) && !excludedProviders.has(p.id));
            if (candidates.length === 0) {
              throw new ProviderFallbackExhaustedError('All candidate AI providers exhausted during fallback', { requestId: request.requestId });
            }
            provider = candidates[0];
          }

          // 3. Admission Control Check
          const activeConcurrentCount = this.lifecycleManager.getActiveRecords().length;
          const admissionResult = this.admissionController.evaluate(request, provider.id, activeConcurrentCount, this.policy.maxConcurrentRequests);
          if (admissionResult.decision !== 'ALLOWED') {
            throw new ProviderAdmissionError(admissionResult.reason, {
              providerId: provider.id,
              requestId: request.requestId,
              retryable: false,
              details: { decision: admissionResult.decision }
            });
          }

          this.usageTracker.recordRequestStart(provider.id, request.requestId);
          this.lifecycleManager.transitionTo(request.requestId, 'EXECUTING', { providerId: provider.id });
          const response = await provider.analyze({ ...request, timeoutMs });
          const normalized = ProviderResponseNormalizer.normalizeAIResponse(response);

          this.lifecycleManager.transitionTo(request.requestId, 'COMPLETED');
          this.metricsCollector.recordSuccess(Date.now() - startTime);
          this.cancellationManager.removeController(request.requestId);
          executionActive = false;

          // Record Success in Cache, Usage Tracker, and Cooldown Manager
          this.responseCache.set(cacheKey, 'AI', normalized, undefined, normalized.providerId);
          this.usageTracker.recordRequestSuccess({
            recordId: `rec_${Date.now()}_${request.requestId}`,
            providerId: provider.id,
            requestId: request.requestId,
            operationType: request.operation,
            requestCount: attemptCount,
            inputTokens: normalized.tokenUsage?.promptTokens,
            outputTokens: normalized.tokenUsage?.completionTokens,
            totalTokens: normalized.tokenUsage?.totalTokens,
            durationMs: Date.now() - startTime,
            timestamp: Date.now(),
            cacheHit: false
          }, normalized.modelName);

          this.cooldownManager.recordSuccess(provider.id, normalized.modelName);

          return normalized;
        } catch (err: unknown) {
          if (err instanceof ProviderAdmissionError) {
            this.lifecycleManager.transitionTo(request.requestId, 'FAILED', { error: err.message });
            this.metricsCollector.recordFailure();
            this.cancellationManager.removeController(request.requestId);
            executionActive = false;
            throw err;
          }

          if (provider) {
            excludedProviders.add(provider.id);
            this.usageTracker.recordRequestFailure({
              recordId: `rec_${Date.now()}_${request.requestId}`,
              providerId: provider.id,
              requestId: request.requestId,
              operationType: request.operation,
              requestCount: attemptCount,
              durationMs: Date.now() - startTime,
              timestamp: Date.now(),
              cacheHit: false
            });
            this.cooldownManager.recordFailure(provider.id, err);
          }

          const errMsg = err instanceof Error ? err.message : String(err);

          if (this.retryManager.shouldRetry(err, attemptCount)) {
            if (provider) this.usageTracker.recordRetry(provider.id);
            this.metricsCollector.recordRetry();
            this.lifecycleManager.transitionTo(request.requestId, 'RETRYING', { error: errMsg });
            await this.retryManager.calculateBackoffAndDelay(attemptCount);
            continue;
          }

          if (this.policy.fallbackEnabled && fallbackCount < this.policy.maxFallbackProviders) {
            const remaining = this.aiRegistry.getEnabled().filter(p => p.capabilities.operations.includes(request.operation) && !excludedProviders.has(p.id));
            if (remaining.length > 0) {
              if (provider) this.usageTracker.recordFallback(provider.id);
              fallbackCount++;
              this.metricsCollector.recordFallback();
              this.lifecycleManager.transitionTo(request.requestId, 'FALLBACK', { error: errMsg });
              continue;
            }
          }

          this.lifecycleManager.transitionTo(request.requestId, 'FAILED', { error: errMsg });
          this.metricsCollector.recordFailure();
          this.cancellationManager.removeController(request.requestId);
          executionActive = false;
          throw err;
        }
      }

      throw new ProviderFallbackExhaustedError('AI execution loop terminated unexpectedly', { requestId: request.requestId });
    });
  }

  async executeSearch(request: SearchRequest): Promise<SearchResponse> {
    if (!request || !request.requestId || !request.query) {
      throw new ProviderRequestValidationError('Invalid Search request object or missing requestId/query');
    }

    const cacheKey = ProviderCacheKeyGenerator.generateSearchKey(request);

    // 1. Check Cache Hit
    const cached = this.responseCache.get<SearchResponse>(cacheKey);
    if (cached) {
      return {
        ...cached,
        requestId: request.requestId,
        correlationId: request.correlationId
      };
    }

    // 2. In-Flight Deduplication & Execution
    return this.deduplicator.execute(cacheKey, async () => {
      this.checkConcurrency();
      const timeoutMs = request.timeoutMs || this.policy.defaultSearchTimeoutMs;
      this.lifecycleManager.createRecord(request.requestId, 'SEARCH', timeoutMs);
      this.metricsCollector.recordRequestCreated();
      this.cancellationManager.createController(request.requestId);

      const startTime = Date.now();
      let attemptCount = 0;
      let fallbackCount = 0;
      const excludedProviders = new Set<string>();
      let executionActive = true;

      while (executionActive) {
        this.cancellationManager.checkCancelled(request.requestId);
        attemptCount++;

        let provider;
        try {
          this.lifecycleManager.transitionTo(request.requestId, 'ROUTING');
          provider = this.searchRouter.selectProvider(request);

          if (excludedProviders.has(provider.id)) {
            const candidates = this.searchRegistry.getEnabled().filter(p => !excludedProviders.has(p.id));
            if (candidates.length === 0) {
              throw new ProviderFallbackExhaustedError('All candidate Search providers exhausted during fallback', { requestId: request.requestId });
            }
            provider = candidates[0];
          }

          // 3. Admission Control Check
          const activeConcurrentCount = this.lifecycleManager.getActiveRecords().length;
          const admissionResult = this.admissionController.evaluate(request, provider.id, activeConcurrentCount, this.policy.maxConcurrentRequests);
          if (admissionResult.decision !== 'ALLOWED') {
            throw new ProviderAdmissionError(admissionResult.reason, {
              providerId: provider.id,
              requestId: request.requestId,
              retryable: false,
              details: { decision: admissionResult.decision }
            });
          }

          this.usageTracker.recordRequestStart(provider.id, request.requestId);
          this.lifecycleManager.transitionTo(request.requestId, 'EXECUTING', { providerId: provider.id });
          const response = await provider.search({ ...request, timeoutMs });
          const normalized = ProviderResponseNormalizer.normalizeSearchResponse(response);

          this.lifecycleManager.transitionTo(request.requestId, 'COMPLETED');
          this.metricsCollector.recordSuccess(Date.now() - startTime);
          this.cancellationManager.removeController(request.requestId);
          executionActive = false;

          // Record Success in Cache, Usage Tracker, and Cooldown Manager
          this.responseCache.set(cacheKey, 'SEARCH', normalized, undefined, normalized.providerId);
          this.usageTracker.recordRequestSuccess({
            recordId: `rec_${Date.now()}_${request.requestId}`,
            providerId: provider.id,
            requestId: request.requestId,
            requestCount: attemptCount,
            durationMs: Date.now() - startTime,
            timestamp: Date.now(),
            cacheHit: false
          });

          this.cooldownManager.recordSuccess(provider.id);

          return normalized;
        } catch (err: unknown) {
          if (err instanceof ProviderAdmissionError) {
            this.lifecycleManager.transitionTo(request.requestId, 'FAILED', { error: err.message });
            this.metricsCollector.recordFailure();
            this.cancellationManager.removeController(request.requestId);
            executionActive = false;
            throw err;
          }

          if (provider) {
            excludedProviders.add(provider.id);
            this.usageTracker.recordRequestFailure({
              recordId: `rec_${Date.now()}_${request.requestId}`,
              providerId: provider.id,
              requestId: request.requestId,
              requestCount: attemptCount,
              durationMs: Date.now() - startTime,
              timestamp: Date.now(),
              cacheHit: false
            });
            this.cooldownManager.recordFailure(provider.id, err);
          }

          const errMsg = err instanceof Error ? err.message : String(err);

          if (this.retryManager.shouldRetry(err, attemptCount)) {
            if (provider) this.usageTracker.recordRetry(provider.id);
            this.metricsCollector.recordRetry();
            this.lifecycleManager.transitionTo(request.requestId, 'RETRYING', { error: errMsg });
            await this.retryManager.calculateBackoffAndDelay(attemptCount);
            continue;
          }

          if (this.policy.fallbackEnabled && fallbackCount < this.policy.maxFallbackProviders) {
            const remaining = this.searchRegistry.getEnabled().filter(p => !excludedProviders.has(p.id));
            if (remaining.length > 0) {
              if (provider) this.usageTracker.recordFallback(provider.id);
              fallbackCount++;
              this.metricsCollector.recordFallback();
              this.lifecycleManager.transitionTo(request.requestId, 'FALLBACK', { error: errMsg });
              continue;
            }
          }

          this.lifecycleManager.transitionTo(request.requestId, 'FAILED', { error: errMsg });
          this.metricsCollector.recordFailure();
          this.cancellationManager.removeController(request.requestId);
          executionActive = false;
          throw err;
        }
      }

      throw new ProviderFallbackExhaustedError('Search execution loop terminated unexpectedly', { requestId: request.requestId });
    });
  }

  cancelRequest(requestId: string): boolean {
    const record = this.lifecycleManager.getRecord(requestId);
    if (!record) return false;
    if (record.state === 'COMPLETED' || record.state === 'FAILED' || record.state === 'CANCELLED') {
      return false;
    }

    const cancelled = this.cancellationManager.cancelRequest(requestId);
    if (cancelled) {
      this.lifecycleManager.transitionTo(requestId, 'CANCELLED');
      this.metricsCollector.recordCancelled();
    }
    return cancelled;
  }

  getRequestStatus(requestId: string): ProviderRequestStatus | null {
    return this.lifecycleManager.getRecord(requestId) || null;
  }

  getActiveRequests(): ProviderRequestStatus[] {
    return this.lifecycleManager.getActiveRecords();
  }

  getMetrics(): ProviderExecutionMetrics {
    return this.metricsCollector.getMetrics();
  }

  getStatus(): ExecutionEngineStatus {
    return this.status;
  }

  async healthCheck(): Promise<ProviderExecutionHealth> {
    return this.healthMonitor.checkHealth();
  }

  async shutdown(): Promise<void> {
    this.status = 'STOPPING';
    await this.recoveryManager.recoverSubsystem('Engine shutdown');
    this.responseCache.clear();
    this.deduplicator.clear();
    this.usageTracker.resetAll();
    this.admissionController.reset();
    this.cooldownManager.reset();
    this.status = 'STOPPED';
  }

  destroy(): void {
    this.cancellationManager.clear();
    this.lifecycleManager.clear();
    this.metricsCollector.clear();
    this.responseCache.clear();
    this.deduplicator.clear();
    this.usageTracker.resetAll();
    this.admissionController.destroy();
    this.cooldownManager.destroy();
    this.status = 'DESTROYED';
  }

  private checkConcurrency(): void {
    const active = this.lifecycleManager.getActiveRecords().length;
    if (active >= this.policy.maxConcurrentRequests) {
      throw new ProviderConcurrencyError(`Execution engine concurrency limit reached (${this.policy.maxConcurrentRequests})`);
    }
  }
}
