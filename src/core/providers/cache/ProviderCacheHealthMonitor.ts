import { ProviderCacheHealth } from './ProviderCacheTypes';
import { ProviderResponseCache } from './ProviderResponseCache';
import { IEventBus } from '../../events/IEventBus';

export class ProviderCacheHealthMonitor {
  constructor(
    private cache: ProviderResponseCache,
    private eventBus?: IEventBus
  ) {}

  checkHealth(): ProviderCacheHealth {
    const currentEntries = this.cache.size();
    const approxSize = this.cache.getTotalSize();
    const policy = this.cache.policy;

    const entryRatio = currentEntries / policy.maxEntries;
    const sizeRatio = approxSize / policy.maxApproximateSizeBytes;
    const evictionPressure = entryRatio > 0.9 || sizeRatio > 0.9;

    let status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' = 'HEALTHY';
    if (entryRatio >= 0.98 || sizeRatio >= 0.98) {
      status = 'DEGRADED';
    }

    if (this.eventBus) {
      this.eventBus.publish('provider.cache_health_changed', { status, evictionPressure, timestamp: Date.now() });
    }

    return {
      status,
      currentEntries,
      approximateSize: approxSize,
      evictionPressure,
      lastCheckedAt: Date.now()
    };
  }
}
