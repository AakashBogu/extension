import { CacheEntry } from './ProviderCacheTypes';
import { ProviderCachePolicy } from './ProviderCachePolicy';
import { ProviderCacheMetricsCollector } from './ProviderCacheMetricsCollector';
import { ProviderCacheEvictionManager } from './ProviderCacheEvictionManager';
import { IEventBus } from '../../events/IEventBus';

export class ProviderResponseCache {
  private entries = new Map<string, CacheEntry<unknown>>();
  private totalSize = 0;
  private accessCounter = 0;

  constructor(
    public readonly policy: ProviderCachePolicy = new ProviderCachePolicy(),
    public readonly metricsCollector: ProviderCacheMetricsCollector = new ProviderCacheMetricsCollector(),
    private eventBus?: IEventBus
  ) {}

  get<T>(cacheKey: string): T | null {
    if (!this.policy.enabled) return null;

    const entry = this.entries.get(cacheKey);
    if (!entry) {
      this.metricsCollector.recordMiss();
      if (this.eventBus) this.eventBus.publish('provider.cache_miss', { cacheKey, timestamp: Date.now() });
      return null;
    }

    if (Date.now() >= entry.expiresAt) {
      this.removeEntry(cacheKey, 'expired');
      this.metricsCollector.recordMiss();
      return null;
    }

    entry.lastAccessedAt = Date.now();
    entry.accessSeq = ++this.accessCounter;
    entry.accessCount++;
    this.metricsCollector.recordHit();

    if (this.eventBus) {
      this.eventBus.publish('provider.cache_hit', { cacheKey, timestamp: Date.now() });
    }

    return entry.response as T;
  }

  set<T>(cacheKey: string, requestType: 'AI' | 'SEARCH', response: T, ttlMs?: number, providerId?: string): void {
    if (!this.policy.enabled || !response) return;

    const effectiveTtl = ttlMs || (requestType === 'AI' ? this.policy.aiTtlMs : this.policy.searchTtlMs);
    const approxSize = ProviderCacheEvictionManager.estimateSize(response);

    // Evict if limits exceeded
    this.ensureCapacity(approxSize);

    const entry: CacheEntry<T> = {
      cacheKey,
      requestType,
      response,
      createdAt: Date.now(),
      expiresAt: Date.now() + effectiveTtl,
      lastAccessedAt: Date.now(),
      accessSeq: ++this.accessCounter,
      accessCount: 1,
      approximateSize: approxSize,
      providerId
    };

    if (this.entries.has(cacheKey)) {
      this.removeEntry(cacheKey, 'overwrite');
    }

    this.entries.set(cacheKey, entry);
    this.totalSize += approxSize;
    this.metricsCollector.recordInsertion(approxSize, this.entries.size, this.totalSize);

    if (this.eventBus) {
      this.eventBus.publish('provider.cache_inserted', { cacheKey, requestType, providerId, timestamp: Date.now() });
    }
  }

  invalidate(cacheKey: string): boolean {
    if (this.entries.has(cacheKey)) {
      this.removeEntry(cacheKey, 'invalidated');
      this.metricsCollector.recordInvalidation(1, this.entries.size, this.totalSize);
      return true;
    }
    return false;
  }

  invalidateByProvider(providerId: string): number {
    let count = 0;
    this.entries.forEach((entry, key) => {
      if (entry.providerId === providerId) {
        this.removeEntry(key, 'invalidated');
        count++;
      }
    });

    if (count > 0) {
      this.metricsCollector.recordInvalidation(count, this.entries.size, this.totalSize);
    }
    return count;
  }

  invalidateByType(requestType: 'AI' | 'SEARCH'): number {
    let count = 0;
    this.entries.forEach((entry, key) => {
      if (entry.requestType === requestType) {
        this.removeEntry(key, 'invalidated');
        count++;
      }
    });

    if (count > 0) {
      this.metricsCollector.recordInvalidation(count, this.entries.size, this.totalSize);
    }
    return count;
  }

  removeExpired(): number {
    let count = 0;
    const now = Date.now();
    this.entries.forEach((entry, key) => {
      if (now >= entry.expiresAt) {
        this.removeEntry(key, 'expired');
        count++;
      }
    });
    return count;
  }

  clear(): void {
    const count = this.entries.size;
    this.entries.clear();
    this.totalSize = 0;
    this.metricsCollector.recordInvalidation(count, 0, 0);

    if (this.eventBus) {
      this.eventBus.publish('provider.cache_cleared', { timestamp: Date.now() });
    }
  }

  size(): number {
    return this.entries.size;
  }

  getTotalSize(): number {
    return this.totalSize;
  }

  private ensureCapacity(newSize: number): void {
    while (this.entries.size >= this.policy.maxEntries || (this.totalSize + newSize > this.policy.maxApproximateSizeBytes && this.entries.size > 0)) {
      const candidateKey = ProviderCacheEvictionManager.findEvictionCandidate(this.entries);
      if (!candidateKey) break;
      this.removeEntry(candidateKey, 'evicted');
    }
  }

  private removeEntry(key: string, reason: 'evicted' | 'expired' | 'invalidated' | 'overwrite'): void {
    const entry = this.entries.get(key);
    if (!entry) return;

    this.entries.delete(key);
    this.totalSize = Math.max(0, this.totalSize - entry.approximateSize);

    if (reason === 'evicted') {
      this.metricsCollector.recordEviction(this.entries.size, this.totalSize);
      if (this.eventBus) this.eventBus.publish('provider.cache_evicted', { cacheKey: key, timestamp: Date.now() });
    } else if (reason === 'expired') {
      this.metricsCollector.recordExpired(this.entries.size, this.totalSize);
      if (this.eventBus) this.eventBus.publish('provider.cache_expired', { cacheKey: key, timestamp: Date.now() });
    } else if (reason === 'invalidated') {
      if (this.eventBus) this.eventBus.publish('provider.cache_invalidated', { cacheKey: key, timestamp: Date.now() });
    }
  }
}
