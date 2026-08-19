import { describe, it, expect } from 'vitest';
import { ProviderCacheMetricsCollector } from '../core/providers/cache/ProviderCacheMetricsCollector';

describe('Module 6E: ProviderCacheMetricsCollector', () => {
  it('should track hits, misses, hit rate, and deduplication metrics', () => {
    const metrics = new ProviderCacheMetricsCollector();

    metrics.recordHit();
    metrics.recordHit();
    metrics.recordMiss();
    metrics.recordDeduplication();

    const stats = metrics.getMetrics();
    expect(stats.cacheHits).toBe(2);
    expect(stats.cacheMisses).toBe(1);
    expect(stats.deduplicatedRequests).toBe(1);
    expect(stats.cacheHitRate).toBe(0.6667);
  });
});
