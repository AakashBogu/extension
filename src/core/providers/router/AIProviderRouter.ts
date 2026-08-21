import { AIProviderRegistry } from '../registry/AIProviderRegistry';
import { ProviderHealthManager } from '../health/ProviderHealthManager';
import { IAIProvider } from '../ai/IAIProvider';
import { AIRequest, AIResponse } from '../ai/AIProviderTypes';
import { ProviderCapabilityError, ProviderRequestError } from '../../error/ProviderErrors';
import { ProviderCooldownManager } from '../limits/ProviderCooldownManager';
import { IEventBus } from '../../events/IEventBus';

export class AIProviderRouter {
  constructor(
    private registry: AIProviderRegistry,
    private healthManager: ProviderHealthManager,
    private cooldownManager?: ProviderCooldownManager,
    private eventBus?: IEventBus
  ) {}

  selectProvider(request: AIRequest): IAIProvider {
    const enabledProviders = this.registry.getEnabled();
    if (enabledProviders.length === 0) {
      if (this.eventBus) this.eventBus.publish('provider.routing_failed', { operation: request.operation, reason: 'No enabled AI providers', timestamp: Date.now() });
      throw new ProviderCapabilityError('No enabled AI providers registered', { requestId: request.requestId, correlationId: request.correlationId });
    }

    // Filter by capable operation
    let capable = enabledProviders.filter(p => p.capabilities.operations.includes(request.operation));
    if (capable.length === 0) {
      if (this.eventBus) this.eventBus.publish('provider.routing_failed', { operation: request.operation, reason: 'No capable AI provider for operation', timestamp: Date.now() });
      throw new ProviderCapabilityError(`No AI provider supports operation [${request.operation}]`, { requestId: request.requestId, correlationId: request.correlationId });
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
      if (this.eventBus) this.eventBus.publish('provider.routing_failed', { operation: request.operation, reason: 'All candidate AI providers are UNHEALTHY', timestamp: Date.now() });
      throw new ProviderRequestError('All candidate AI providers are UNHEALTHY', { providerId: selected.id, requestId: request.requestId, correlationId: request.correlationId });
    }

    if (this.eventBus) {
      this.eventBus.publish('provider.routing_selected', { providerId: selected.id, operation: request.operation, requestId: request.requestId, timestamp: Date.now() });
    }

    return selected;
  }

  async executeWithFallback(request: AIRequest): Promise<AIResponse> {
    const enabledProviders = this.registry.getEnabled().filter(p => p.capabilities.operations.includes(request.operation));
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
