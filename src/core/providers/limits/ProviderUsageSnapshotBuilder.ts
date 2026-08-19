import { AggregateUsageMetrics, ProviderUsageSnapshot } from './ProviderUsageTrackerTypes';
import { RateLimitWindow } from './ProviderRateLimitTypes';

export class ProviderUsageSnapshotBuilder {
  static createSnapshot(
    providerId: string,
    metrics: AggregateUsageMetrics,
    modelId?: string,
    window?: RateLimitWindow
  ): ProviderUsageSnapshot {
    const avgDuration = metrics.successfulRequests + metrics.failedRequests > 0
      ? Math.round(metrics.totalDurationMs / (metrics.successfulRequests + metrics.failedRequests))
      : 0;

    return {
      providerId,
      modelId,
      timestamp: Date.now(),
      metrics: {
        ...metrics,
        averageDurationMs: avgDuration
      },
      window
    };
  }
}
