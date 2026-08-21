import { AIProviderRegistry } from '../registry/AIProviderRegistry';
import { ProviderHealthManager } from '../health/ProviderHealthManager';
import { IAIProvider } from '../ai/IAIProvider';
import { AIRequest, AIResponse } from '../ai/AIProviderTypes';
import { ProviderCapabilityError, ProviderRequestError } from '../../error/ProviderErrors';
import { ProviderCooldownManager } from '../limits/ProviderCooldownManager';
import { ProviderQuotaManager } from '../limits/ProviderQuotaManager';
import { ProviderQuotaRoutingPolicy } from '../limits/ProviderQuotaRoutingPolicy';
import { ProviderQuotaRoutingError } from '../../error/ProviderQuotaErrors';
import { IEventBus } from '../../events/IEventBus';

export class AIProviderRouter {
  public quotaRoutingPolicy: ProviderQuotaRoutingPolicy;

  constructor(
    private registry: AIProviderRegistry,
    private healthManager: ProviderHealthManager,
    private cooldownManager?: ProviderCooldownManager,
    private quotaManager?: ProviderQuotaManager,
    quotaRoutingPolicy?: ProviderQuotaRoutingPolicy,
    private eventBus?: IEventBus
  ) {
    this.quotaRoutingPolicy = quotaRoutingPolicy || new ProviderQuotaRoutingPolicy();
  }

  selectProvider(request: AIRequest): IAIProvider {
    const enabledProviders = this.registry.getEnabled();
    if (enabledProviders.length === 0) {
      if (this.eventBus) this.eventBus.publish('provider.routing_failed', { operation: request.operation, reason: 'No enabled AI providers', timestamp: Date.now() });
      throw new ProviderCapabilityError('No enabled AI providers registered', { requestId: request.requestId, correlationId: request.correlationId });
    }

    // Filter by capable operation
    const capable = enabledProviders.filter(p => p.capabilities.operations.includes(request.operation));
    if (capable.length === 0) {
      if (this.eventBus) this.eventBus.publish('provider.routing_failed', { operation: request.operation, reason: 'No capable AI provider for operation', timestamp: Date.now() });
      throw new ProviderCapabilityError(`No AI provider supports operation [${request.operation}]`, { requestId: request.requestId, correlationId: request.correlationId });
    }

    // Check if ALL candidate providers are quota exhausted
    if (this.quotaManager && this.quotaRoutingPolicy.excludeExhausted) {
      const allExhausted = capable.every(p => this.quotaManager!.isExhausted(p.id));
      if (allExhausted) {
        if (this.eventBus) this.eventBus.publish('provider.routing_failed', { operation: request.operation, reason: 'All candidate AI providers are quota exhausted', timestamp: Date.now() });
        throw new ProviderQuotaRoutingError('All candidate AI providers have exhausted their quota', { requestId: request.requestId, correlationId: request.correlationId });
      }
    }

    // Rank candidates using HealthManager scoring
    const ranked = this.healthManager.rankProviders(capable, this.cooldownManager, this.quotaManager);
    const eligible = ranked.filter(r => r.score.isEligible);

    if (eligible.length === 0) {
      const topChoice = ranked[0].provider;
      if (this.eventBus) this.eventBus.publish('provider.routing_failed', { operation: request.operation, reason: 'All candidate AI providers are inoperable or UNHEALTHY', timestamp: Date.now() });
      throw new ProviderRequestError('All candidate AI providers are UNHEALTHY or inoperable', { providerId: topChoice.id, requestId: request.requestId, correlationId: request.correlationId });
    }

    const selected = eligible[0].provider;

    if (this.eventBus) {
      this.eventBus.publish('provider.routing_selected', { providerId: selected.id, operation: request.operation, requestId: request.requestId, timestamp: Date.now() });
    }

    return selected;
  }

  async executeWithFallback(request: AIRequest): Promise<AIResponse> {
    const capable = this.registry.getEnabled().filter(p => p.capabilities.operations.includes(request.operation));
    const ranked = this.healthManager.rankProviders(capable, this.cooldownManager, this.quotaManager);

    let lastError: Error | null = null;

    for (const entry of ranked) {
      if (!entry.score.isEligible) continue;
      const provider = entry.provider;
      const startTime = Date.now();

      try {
        const response = await provider.analyze(request);
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

    throw lastError || new ProviderRequestError('All AI providers failed execution', { requestId: request.requestId, correlationId: request.correlationId });
  }
}
