import { SearchProviderRegistry } from '../registry/SearchProviderRegistry';
import { ProviderHealthManager } from '../health/ProviderHealthManager';
import { ISearchProvider } from '../search/ISearchProvider';
import { SearchRequest, SearchResponse, SearchCapabilityFlag } from '../search/SearchProviderTypes';
import { ProviderCapabilityError, ProviderRequestError } from '../../error/ProviderErrors';
import { ProviderCooldownManager } from '../limits/ProviderCooldownManager';
import { IEventBus } from '../../events/IEventBus';

export class SearchProviderRouter {
  constructor(
    private registry: SearchProviderRegistry,
    private healthManager: ProviderHealthManager,
    private cooldownManager?: ProviderCooldownManager,
    private eventBus?: IEventBus
  ) {}

  selectProvider(request: SearchRequest, requiredCapabilities: SearchCapabilityFlag[] = []): ISearchProvider {
    const enabledProviders = this.registry.getEnabled();
    if (enabledProviders.length === 0) {
      if (this.eventBus) this.eventBus.publish('provider.routing_failed', { query: request.query, reason: 'No enabled search providers', timestamp: Date.now() });
      throw new ProviderCapabilityError('No enabled search providers registered', { requestId: request.requestId, correlationId: request.correlationId });
    }

    // Filter by required capability flags
    let capable = enabledProviders.filter(p =>
      requiredCapabilities.every(cap => p.capabilities.capabilities.includes(cap))
    );

    if (capable.length === 0) {
      if (this.eventBus) this.eventBus.publish('provider.routing_failed', { query: request.query, reason: 'No capable search provider for required capabilities', timestamp: Date.now() });
      throw new ProviderCapabilityError('No search provider supports required capabilities', { requestId: request.requestId, correlationId: request.correlationId });
    }

    // Filter out providers in active cooldown if cooldownManager is provided
    if (this.cooldownManager) {
      const activeCapable = capable.filter(p => !this.cooldownManager!.isInCooldown(p.id));
      if (activeCapable.length > 0) {
        capable = activeCapable;
      }
    }

    // Deterministic ranking: HEALTHY > DEGRADED > UNHEALTHY, then Priority desc, then ID asc
    const sorted = capable.sort((a, b) => {
      const hA = this.healthManager.getHealth(a.id);
      const hB = this.healthManager.getHealth(b.id);

      const healthRank = (h: string) => (h === 'HEALTHY' ? 3 : h === 'DEGRADED' ? 2 : 1);
      const diffHealth = healthRank(hB) - healthRank(hA);
      if (diffHealth !== 0) return diffHealth;

      const diffPriority = b.priority - a.priority;
      if (diffPriority !== 0) return diffPriority;

      return a.id.localeCompare(b.id);
    });

    const selected = sorted[0];
    if (this.healthManager.getHealth(selected.id) === 'UNHEALTHY') {
      if (this.eventBus) this.eventBus.publish('provider.routing_failed', { query: request.query, reason: 'All candidate search providers are UNHEALTHY', timestamp: Date.now() });
      throw new ProviderRequestError('All candidate search providers are UNHEALTHY', { providerId: selected.id, requestId: request.requestId, correlationId: request.correlationId });
    }

    if (this.eventBus) {
      this.eventBus.publish('provider.routing_selected', { providerId: selected.id, requestId: request.requestId, timestamp: Date.now() });
    }

    return selected;
  }

  async executeWithFallback(request: SearchRequest, requiredCapabilities: SearchCapabilityFlag[] = []): Promise<SearchResponse> {
    const enabledProviders = this.registry.getEnabled().filter(p =>
      requiredCapabilities.every(cap => p.capabilities.capabilities.includes(cap))
    );

    const sorted = enabledProviders.sort((a, b) => {
      const hA = this.healthManager.getHealth(a.id);
      const hB = this.healthManager.getHealth(b.id);
      const healthRank = (h: string) => (h === 'HEALTHY' ? 3 : h === 'DEGRADED' ? 2 : 1);
      const diffHealth = healthRank(hB) - healthRank(hA);
      if (diffHealth !== 0) return diffHealth;
      const diffPriority = b.priority - a.priority;
      if (diffPriority !== 0) return diffPriority;
      return a.id.localeCompare(b.id);
    });

    let lastError: Error | null = null;

    for (const provider of sorted) {
      if (this.healthManager.getHealth(provider.id) === 'UNHEALTHY') continue;
      if (this.cooldownManager && this.cooldownManager.isInCooldown(provider.id)) continue;

      const startTime = Date.now();
      try {
        const response = await provider.search(request);
        this.healthManager.recordSuccess(provider.id, Date.now() - startTime);
        return response;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.healthManager.recordFailure(provider.id, lastError.message);

        if (this.eventBus) {
          this.eventBus.publish('provider.request_failed', { providerId: provider.id, requestId: request.requestId, error: lastError.message, timestamp: Date.now() });
          this.eventBus.publish('provider.fallback_selected', { failedProviderId: provider.id, requestId: request.requestId, timestamp: Date.now() });
        }
      }
    }

    throw lastError || new ProviderRequestError('All search providers failed execution', { requestId: request.requestId, correlationId: request.correlationId });
  }
}
