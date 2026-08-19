import { ProviderCacheMetricsCollector } from './ProviderCacheMetricsCollector';
import { IEventBus } from '../../events/IEventBus';

export class ProviderInFlightDeduplicator {
  private inFlight = new Map<string, Promise<unknown>>();

  constructor(
    private metricsCollector?: ProviderCacheMetricsCollector,
    private eventBus?: IEventBus
  ) {}

  has(cacheKey: string): boolean {
    return this.inFlight.has(cacheKey);
  }

  join<T>(cacheKey: string): Promise<T> {
    const existing = this.inFlight.get(cacheKey);
    if (!existing) {
      throw new Error(`No in-flight request found for key [${cacheKey}]`);
    }

    if (this.metricsCollector) this.metricsCollector.recordDeduplication();
    if (this.eventBus) this.eventBus.publish('provider.cache_deduplicated', { cacheKey, timestamp: Date.now() });

    return existing as Promise<T>;
  }

  execute<T>(cacheKey: string, executor: () => Promise<T>): Promise<T> {
    if (this.inFlight.has(cacheKey)) {
      return this.join<T>(cacheKey);
    }

    if (this.metricsCollector) this.metricsCollector.recordInFlightStart();

    const promise = (async () => {
      try {
        return await executor();
      } finally {
        this.inFlight.delete(cacheKey);
        if (this.metricsCollector) this.metricsCollector.recordInFlightEnd();
      }
    })();

    this.inFlight.set(cacheKey, promise);
    return promise;
  }

  clear(): void {
    this.inFlight.clear();
  }
}
