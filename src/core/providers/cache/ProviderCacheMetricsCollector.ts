import { ProviderCacheMetrics } from './ProviderCacheTypes';

export class ProviderCacheMetricsCollector {
  private metrics: ProviderCacheMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    expiredEntries: 0,
    evictions: 0,
    invalidations: 0,
    insertions: 0,
    currentEntries: 0,
    approximateSize: 0,
    inFlightRequests: 0,
    deduplicatedRequests: 0,
    cacheHitRate: 0
  };

  recordHit(): void {
    this.metrics.cacheHits++;
    this.recalculateHitRate();
  }

  recordMiss(): void {
    this.metrics.cacheMisses++;
    this.recalculateHitRate();
  }

  recordInsertion(_entrySize: number, currentEntries: number, totalSize: number): void {
    this.metrics.insertions++;
    this.metrics.currentEntries = currentEntries;
    this.metrics.approximateSize = totalSize;
  }

  recordEviction(currentEntries: number, totalSize: number): void {
    this.metrics.evictions++;
    this.metrics.currentEntries = currentEntries;
    this.metrics.approximateSize = totalSize;
  }

  recordExpired(currentEntries: number, totalSize: number): void {
    this.metrics.expiredEntries++;
    this.metrics.currentEntries = currentEntries;
    this.metrics.approximateSize = totalSize;
  }

  recordInvalidation(count: number, currentEntries: number, totalSize: number): void {
    this.metrics.invalidations += count;
    this.metrics.currentEntries = currentEntries;
    this.metrics.approximateSize = totalSize;
  }

  recordInFlightStart(): void {
    this.metrics.inFlightRequests++;
  }

  recordInFlightEnd(): void {
    this.metrics.inFlightRequests = Math.max(0, this.metrics.inFlightRequests - 1);
  }

  recordDeduplication(): void {
    this.metrics.deduplicatedRequests++;
  }

  getMetrics(): ProviderCacheMetrics {
    return { ...this.metrics };
  }

  private recalculateHitRate(): void {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    this.metrics.cacheHitRate = total > 0 ? parseFloat((this.metrics.cacheHits / total).toFixed(4)) : 0;
  }

  clear(): void {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      expiredEntries: 0,
      evictions: 0,
      invalidations: 0,
      insertions: 0,
      currentEntries: 0,
      approximateSize: 0,
      inFlightRequests: 0,
      deduplicatedRequests: 0,
      cacheHitRate: 0
    };
  }
}
