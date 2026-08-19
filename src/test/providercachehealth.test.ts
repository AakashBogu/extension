import { describe, it, expect } from 'vitest';
import { ProviderResponseCache } from '../core/providers/cache/ProviderResponseCache';
import { ProviderCacheHealthMonitor } from '../core/providers/cache/ProviderCacheHealthMonitor';

describe('Module 6E: ProviderCacheHealthMonitor', () => {
  it('should report healthy state and detect eviction pressure', () => {
    const cache = new ProviderResponseCache();
    const monitor = new ProviderCacheHealthMonitor(cache);

    const health = monitor.checkHealth();
    expect(health.status).toBe('HEALTHY');
    expect(health.evictionPressure).toBe(false);
  });
});
