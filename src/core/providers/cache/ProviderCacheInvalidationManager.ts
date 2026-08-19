import { ProviderResponseCache } from './ProviderResponseCache';

export class ProviderCacheInvalidationManager {
  constructor(private cache: ProviderResponseCache) {}

  invalidateAll(): void {
    this.cache.clear();
  }

  invalidateProvider(providerId: string): number {
    return this.cache.invalidateByProvider(providerId);
  }

  invalidateType(requestType: 'AI' | 'SEARCH'): number {
    return this.cache.invalidateByType(requestType);
  }
}
