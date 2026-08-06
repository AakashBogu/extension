import { InvalidProviderError } from '../../core/error/DIPluginErrors';

export interface ProviderEntry<T> {
  id: string;
  provider: T;
  priority: number;
}

export class ProviderRegistry<T> {
  protected providers = new Map<string, ProviderEntry<T>>();
  protected defaultProviderId: string | null = null;

  register(id: string, provider: T, priority: number = 0): void {
    if (!id || !provider) {
      throw new InvalidProviderError(id || 'unknown', 'Provider ID or instance missing');
    }
    this.providers.set(id, { id, provider, priority });

    if (!this.defaultProviderId) {
      this.defaultProviderId = id;
    }
  }

  unregister(id: string): void {
    this.providers.delete(id);
    if (this.defaultProviderId === id) {
      const remaining = Array.from(this.providers.keys());
      this.defaultProviderId = remaining.length > 0 ? remaining[0] : null;
    }
  }

  resolve(id: string): T {
    const entry = this.providers.get(id);
    if (!entry) {
      throw new InvalidProviderError(id, 'Provider not found in registry');
    }
    return entry.provider;
  }

  setDefault(id: string): void {
    if (!this.providers.has(id)) {
      throw new InvalidProviderError(id, 'Cannot set default: Provider not registered');
    }
    this.defaultProviderId = id;
  }

  getDefault(): T | undefined {
    if (!this.defaultProviderId) return undefined;
    return this.providers.get(this.defaultProviderId)?.provider;
  }

  listProviders(): ProviderEntry<T>[] {
    return Array.from(this.providers.values()).sort((a, b) => b.priority - a.priority);
  }
}
