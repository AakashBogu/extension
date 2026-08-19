import { ISearchProvider } from '../search/ISearchProvider';
import { ProviderValidator } from './ProviderValidator';
import { ProviderConfigurationError } from '../../error/ProviderErrors';
import { IEventBus } from '../../events/IEventBus';

export class SearchProviderRegistry {
  private providers = new Map<string, ISearchProvider>();

  constructor(private eventBus?: IEventBus) {}

  async register(provider: ISearchProvider): Promise<void> {
    ProviderValidator.validateSearchProvider(provider);

    if (this.providers.has(provider.id)) {
      throw new ProviderConfigurationError(`Search provider [${provider.id}] is already registered`, { providerId: provider.id });
    }

    if (this.eventBus) {
      this.eventBus.publish('provider.initialization_started', { providerId: provider.id, type: 'SEARCH', timestamp: Date.now() });
    }

    try {
      await provider.initialize();
      this.providers.set(provider.id, provider);

      if (this.eventBus) {
        this.eventBus.publish('provider.registered', { providerId: provider.id, type: 'SEARCH', timestamp: Date.now() });
        this.eventBus.publish('provider.initialization_completed', { providerId: provider.id, type: 'SEARCH', timestamp: Date.now() });
      }
    } catch (err) {
      if (this.eventBus) {
        this.eventBus.publish('provider.initialization_failed', { providerId: provider.id, type: 'SEARCH', error: String(err), timestamp: Date.now() });
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
        this.eventBus.publish('provider.unregistered', { providerId, type: 'SEARCH', timestamp: Date.now() });
      }
    }
  }

  get(providerId: string): ISearchProvider | undefined {
    return this.providers.get(providerId);
  }

  has(providerId: string): boolean {
    return this.providers.has(providerId);
  }

  getAll(): ISearchProvider[] {
    return Array.from(this.providers.values());
  }

  getEnabled(): ISearchProvider[] {
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
