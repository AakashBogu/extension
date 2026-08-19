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

  constructor(
    public readonly aiRouter: AIProviderRouter,
    public readonly searchRouter: SearchProviderRouter,
    public readonly aiRegistry: AIProviderRegistry,
    public readonly searchRegistry: SearchProviderRegistry,
    public readonly healthManager: ProviderHealthManager,
    policyConfig?: ProviderExecutionPolicy | ExecutionPolicyConfig,
    private eventBus?: IEventBus
  ) {
    this.policy = policyConfig instanceof ProviderExecutionPolicy ? policyConfig : new ProviderExecutionPolicy(policyConfig);
    this.lifecycleManager = new RequestLifecycleManager(this.policy.requestRetentionLimit, eventBus);
    this.retryManager = new ProviderRetryManager(this.policy.maxRetryAttempts, this.policy.initialRetryDelayMs, this.policy.maxRetryDelayMs);
    this.cancellationManager = new ProviderRequestCancellationManager(eventBus);
    this.metricsCollector = new ProviderExecutionMetricsCollector();
    this.healthMonitor = new ProviderExecutionHealthMonitor(healthManager, this.metricsCollector, eventBus);
    this.recoveryManager = new ProviderExecutionRecoveryManager(this.lifecycleManager, this.cancellationManager, this.metricsCollector, eventBus);
  }

  async initialize(): Promise<void> {
    this.status = 'INITIALIZING';
    if (this.eventBus) {
      this.eventBus.publish('provider.execution_initialized', { timestamp: Date.now() });
    }
    this.status = 'READY';
  }

  async executeAI(request: AIRequest): Promise<AIResponse> {
    if (!request || !request.requestId || !request.operation) {
      throw new ProviderRequestValidationError('Invalid AI request object or missing requestId/operation');
    }

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

        this.lifecycleManager.transitionTo(request.requestId, 'EXECUTING', { providerId: provider.id });
        const response = await provider.analyze({ ...request, timeoutMs });
        const normalized = ProviderResponseNormalizer.normalizeAIResponse(response);

        this.lifecycleManager.transitionTo(request.requestId, 'COMPLETED');
        this.metricsCollector.recordSuccess(Date.now() - startTime);
        this.cancellationManager.removeController(request.requestId);
        executionActive = false;

        return normalized;
      } catch (err: unknown) {
        if (provider) excludedProviders.add(provider.id);
        const errMsg = err instanceof Error ? err.message : String(err);

        if (this.retryManager.shouldRetry(err, attemptCount)) {
          this.metricsCollector.recordRetry();
          this.lifecycleManager.transitionTo(request.requestId, 'RETRYING', { error: errMsg });
          await this.retryManager.calculateBackoffAndDelay(attemptCount);
          continue;
        }

        if (this.policy.fallbackEnabled && fallbackCount < this.policy.maxFallbackProviders) {
          const remaining = this.aiRegistry.getEnabled().filter(p => p.capabilities.operations.includes(request.operation) && !excludedProviders.has(p.id));
          if (remaining.length > 0) {
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
  }

  async executeSearch(request: SearchRequest): Promise<SearchResponse> {
    if (!request || !request.requestId || !request.query) {
      throw new ProviderRequestValidationError('Invalid Search request object or missing requestId/query');
    }

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

        this.lifecycleManager.transitionTo(request.requestId, 'EXECUTING', { providerId: provider.id });
        const response = await provider.search({ ...request, timeoutMs });
        const normalized = ProviderResponseNormalizer.normalizeSearchResponse(response);

        this.lifecycleManager.transitionTo(request.requestId, 'COMPLETED');
        this.metricsCollector.recordSuccess(Date.now() - startTime);
        this.cancellationManager.removeController(request.requestId);
        executionActive = false;

        return normalized;
      } catch (err: unknown) {
        if (provider) excludedProviders.add(provider.id);
        const errMsg = err instanceof Error ? err.message : String(err);

        if (this.retryManager.shouldRetry(err, attemptCount)) {
          this.metricsCollector.recordRetry();
          this.lifecycleManager.transitionTo(request.requestId, 'RETRYING', { error: errMsg });
          await this.retryManager.calculateBackoffAndDelay(attemptCount);
          continue;
        }

        if (this.policy.fallbackEnabled && fallbackCount < this.policy.maxFallbackProviders) {
          const remaining = this.searchRegistry.getEnabled().filter(p => !excludedProviders.has(p.id));
          if (remaining.length > 0) {
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
    this.status = 'STOPPED';
  }

  destroy(): void {
    this.cancellationManager.clear();
    this.lifecycleManager.clear();
    this.metricsCollector.clear();
    this.status = 'DESTROYED';
  }

  private checkConcurrency(): void {
    const active = this.lifecycleManager.getActiveRecords().length;
    if (active >= this.policy.maxConcurrentRequests) {
      throw new ProviderConcurrencyError(`Execution engine concurrency limit reached (${this.policy.maxConcurrentRequests})`);
    }
  }
}
