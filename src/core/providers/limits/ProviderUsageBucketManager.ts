import { RateLimitWindow } from './ProviderRateLimitTypes';
import { AggregateUsageMetrics, UsageBucket } from './ProviderUsageTrackerTypes';
import { ProviderUsageRecord } from './ProviderUsageTypes';

export class ProviderUsageBucketManager {
  private buckets = new Map<string, UsageBucket>();

  static getWindowDurationMs(window: RateLimitWindow, customWindowMs?: number): number {
    switch (window) {
      case 'SECOND': return 1000;
      case 'MINUTE': return 60000;
      case 'HOUR': return 3600000;
      case 'DAY': return 86400000;
      case 'MONTH': return 2592000000; // 30 days
      case 'CUSTOM': return customWindowMs || 60000;
    }
  }

  getOrCreateBucket(
    entityKey: string,
    window: RateLimitWindow,
    now: number = Date.now(),
    customWindowMs?: number
  ): UsageBucket {
    const windowMs = ProviderUsageBucketManager.getWindowDurationMs(window, customWindowMs);
    const startTime = Math.floor(now / windowMs) * windowMs;
    const endTime = startTime + windowMs;
    const bucketKey = `${entityKey}:${window}:${startTime}`;

    let bucket = this.buckets.get(bucketKey);
    if (!bucket || now >= bucket.endTime) {
      bucket = {
        window,
        startTime,
        endTime,
        metrics: this.createEmptyMetrics()
      };
      this.buckets.set(bucketKey, bucket);
      this.pruneObsoleteBuckets(now);
    }

    return bucket;
  }

  recordUsage(bucket: UsageBucket, record: ProviderUsageRecord, isSuccess: boolean): void {
    const m = bucket.metrics;
    m.totalRequests++;
    m.attemptCount += record.requestCount || 1;

    if (isSuccess) {
      m.successfulRequests++;
    } else {
      m.failedRequests++;
    }

    m.totalDurationMs += record.durationMs || 0;
    if (m.successfulRequests + m.failedRequests > 0) {
      m.averageDurationMs = Math.round(m.totalDurationMs / (m.successfulRequests + m.failedRequests));
    }

    if (typeof record.totalTokens === 'number') m.totalTokens += record.totalTokens;
    if (typeof record.inputTokens === 'number') m.inputTokens += record.inputTokens;
    if (typeof record.outputTokens === 'number') m.outputTokens += record.outputTokens;
    if (typeof record.estimatedCost === 'number') m.estimatedCost += record.estimatedCost;
  }

  clear(): void {
    this.buckets.clear();
  }

  private pruneObsoleteBuckets(now: number): void {
    if (this.buckets.size <= 200) return;
    this.buckets.forEach((bucket, key) => {
      if (now > bucket.endTime + 86400000) {
        this.buckets.delete(key);
      }
    });
  }

  private createEmptyMetrics(): AggregateUsageMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      attemptCount: 0,
      retryCount: 0,
      fallbackCount: 0,
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCost: 0,
      totalDurationMs: 0,
      averageDurationMs: 0,
      currentConcurrentRequests: 0,
      peakConcurrentRequests: 0
    };
  }
}
