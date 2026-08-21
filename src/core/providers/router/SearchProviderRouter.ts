import { SearchProviderRegistry } from '../registry/SearchProviderRegistry';
import { ProviderHealthManager } from '../health/ProviderHealthManager';
import { ISearchProvider } from '../search/ISearchProvider';
import { SearchRequest, SearchResponse, SearchCapabilityFlag } from '../search/SearchProviderTypes';
import { ProviderCapabilityError, ProviderRequestError } from '../../error/ProviderErrors';
import { ProviderCooldownManager } from '../limits/ProviderCooldownManager';
import { ProviderQuotaManager } from '../limits/ProviderQuotaManager';
import { ProviderQuotaRoutingPolicy } from '../limits/ProviderQuotaRoutingPolicy';
import { ProviderQuotaRoutingError } from '../../error/ProviderQuotaErrors';
import { ProviderRoutingOptimizer } from './ProviderRoutingOptimizer';
import { ProviderAdaptiveRoutingPolicy } from './ProviderAdaptiveRoutingPolicy';
import { IEventBus } from '../../events/IEventBus';

export class SearchProviderRouter {
  public quotaRoutingPolicy: ProviderQuotaRoutingPolicy;
  public optimizer: ProviderRoutingOptimizer;
  public adaptivePolicy: ProviderAdaptiveRoutingPolicy;

  constructor(
    private registry: SearchProviderRegistry,
    private healthManager: ProviderHealthManager,
    private cooldownManager?: ProviderCooldownManager,
    private quotaManager?: ProviderQuotaManager,
    quotaRoutingPolicy?: ProviderQuotaRoutingPolicy,
    optimizer?: ProviderRoutingOptimizer,
    adaptivePolicy?: ProviderAdaptiveRoutingPolicy,
    private eventBus?: IEventBus
  ) {
    this.quotaRoutingPolicy = quotaRoutingPolicy || new ProviderQuotaRoutingPolicy();
    this.optimizer = optimizer || new ProviderRoutingOptimizer(undefined, eventBus);
    this.adaptivePolicy = adaptivePolicy || new ProviderAdaptiveRoutingPolicy({ requestType: 'SEARCH' });
  }

  selectProvider(request: SearchRequest, requiredCapabilities: SearchCapabilityFlag[] = []): ISearchProvider {
    const enabledProviders = this.registry.getEnabled();
    if (enabledProviders.length === 0) {
      if (this.eventBus) this.eventBus.publish('provider.routing_failed', { query: request.query, reason: 'No enabled search providers', timestamp: Date.now() });
      throw new ProviderCapabilityError('No enabled search providers registered', { requestId: request.requestId, correlationId: request.correlationId });
    }

    // Filter by required capability flags
    const capable = enabledProviders.filter(p =>
      requiredCapabilities.every(cap => p.capabilities.capabilities.includes(cap))
    );

    if (capable.length === 0) {
      if (this.eventBus) this.eventBus.publish('provider.routing_failed', { query: request.query, reason: 'No capable search provider for required capabilities', timestamp: Date.now() });
      throw new ProviderCapabilityError('No search provider supports required capabilities', { requestId: request.requestId, correlationId: request.correlationId });
    }

    // Check if ALL candidate providers are quota exhausted
    if (this.quotaManager && this.quotaRoutingPolicy.excludeExhausted) {
      const allExhausted = capable.every(p => this.quotaManager!.isExhausted(p.id));
      if (allExhausted) {
        if (this.eventBus) this.eventBus.publish('provider.routing_failed', { query: request.query, reason: 'All candidate search providers are quota exhausted', timestamp: Date.now() });
        throw new ProviderQuotaRoutingError('All candidate search providers have exhausted their quota', { requestId: request.requestId, correlationId: request.correlationId });
      }
    }

    // Rank candidates using 6F.7 HealthManager scoring
    const ranked = this.healthManager.rankProviders(capable, this.cooldownManager, this.quotaManager);

    // Apply 6F.8 Adaptive Routing Optimization
    const optimized = this.optimizer.optimizeCandidates(ranked, 'SEARCH', this.adaptivePolicy);
    const eligible = optimized.filter(entry => entry.decision.finalScore > 0);

    if (eligible.length === 0) {
      const topChoice = ranked[0].provider;
      if (this.eventBus) this.eventBus.publish('provider.routing_failed', { query: request.query, reason: 'All candidate search providers are UNHEALTHY or inoperable', timestamp: Date.now() });
      throw new ProviderRequestError('All candidate search providers are UNHEALTHY or inoperable', { providerId: topChoice.id, requestId: request.requestId, correlationId: request.correlationId });
    }

    const selected = eligible[0].provider;
    this.optimizer.outcomeTracker.recordSelection(selected.id, 'SEARCH');

    if (this.eventBus) {
      this.eventBus.publish('provider.routing_selected', { providerId: selected.id, requestId: request.requestId, timestamp: Date.now() });
    }

    return selected;
  }

  async executeWithFallback(request: SearchRequest, requiredCapabilities: SearchCapabilityFlag[] = []): Promise<SearchResponse> {
    const capable = this.registry.getEnabled().filter(p =>
      requiredCapabilities.every(cap => p.capabilities.capabilities.includes(cap))
    );

    const ranked = this.healthManager.rankProviders(capable, this.cooldownManager, this.quotaManager);
    const optimized = this.optimizer.optimizeCandidates(ranked, 'SEARCH', this.adaptivePolicy);

    let lastError: Error | null = null;

    for (const entry of optimized) {
      if (entry.decision.finalScore <= 0) continue;
      const provider = entry.provider;
      const startTime = Date.now();

      try {
        const response = await provider.search(request);
        const latencyMs = Date.now() - startTime;
        this.healthManager.recordSuccess(provider.id, latencyMs);
        this.optimizer.outcomeTracker.recordOutcome(provider.id, 'SEARCH', true, latencyMs);
        return response;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const latencyMs = Date.now() - startTime;
        this.healthManager.recordFailure(provider.id, lastError.message);
        this.optimizer.outcomeTracker.recordOutcome(provider.id, 'SEARCH', false, latencyMs);

        if (this.eventBus) {
          this.eventBus.publish('provider.request_failed', { providerId: provider.id, requestId: request.requestId, error: lastError.message, timestamp: Date.now() });
          this.eventBus.publish('provider.fallback_selected', { failedProviderId: provider.id, requestId: request.requestId, timestamp: Date.now() });
        }
      }
    }

    throw lastError || new ProviderRequestError('All search providers failed execution', { requestId: request.requestId, correlationId: request.correlationId });
  }
}
