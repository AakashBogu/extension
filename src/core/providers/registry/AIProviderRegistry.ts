import { IAIProvider } from '../ai/IAIProvider';
import { ProviderValidator } from './ProviderValidator';
import { ProviderConfigurationError } from '../../error/ProviderErrors';
import { IEventBus } from '../../events/IEventBus';

export class AIProviderRegistry {
  private providers = new Map<string, IAIProvider>();

  constructor(private eventBus?: IEventBus) {}

  async register(provider: IAIProvider): Promise<void> {
    ProviderValidator.validateAIProvider(provider);

    if (this.providers.has(provider.id)) {
      throw new ProviderConfigurationError(`AI provider [${provider.id}] is already registered`, { providerId: provider.id });
    }

    if (this.eventBus) {
      this.eventBus.publish('provider.initialization_started', { providerId: provider.id, type: 'AI', timestamp: Date.now() });
    }

    try {
      await provider.initialize();
      this.providers.set(provider.id, provider);

      if (this.eventBus) {
        this.eventBus.publish('provider.registered', { providerId: provider.id, type: 'AI', timestamp: Date.now() });
        this.eventBus.publish('provider.initialization_completed', { providerId: provider.id, type: 'AI', timestamp: Date.now() });
      }
    } catch (err) {
      if (this.eventBus) {
        this.eventBus.publish('provider.initialization_failed', { providerId: provider.id, type: 'AI', error: String(err), timestamp: Date.now() });
      }
      throw err;
    }
  }

  async unregister(providerId: string): Promise<void> {
    const provider = this.providers.get(providerId);
    if (!provider) return;

    try {
      provider.destroy();
    } finally {
      this.providers.delete(providerId);
      if (this.eventBus) {
        this.eventBus.publish('provider.unregistered', { providerId, type: 'AI', timestamp: Date.now() });
      }
    }
  }

  get(providerId: string): IAIProvider | undefined {
    return this.providers.get(providerId);
  }

  has(providerId: string): boolean {
    return this.providers.has(providerId);
  }

  getAll(): IAIProvider[] {
    return Array.from(this.providers.values());
  }

  getEnabled(): IAIProvider[] {
    return this.getAll().filter(p => p.enabled);
  }

  clear(): void {
    this.providers.forEach(p => {
      try {
        p.destroy();
      } catch (_err) {
        // Safe disposal fallback
      }
    });
    this.providers.clear();
  }

  size(): number {
    return this.providers.size;
  }
}
