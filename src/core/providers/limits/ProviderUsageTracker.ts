import { ProviderUsageMetricsCollector } from './ProviderUsageMetricsCollector';
import { ProviderUsageBucketManager } from './ProviderUsageBucketManager';
import { ProviderUsageSnapshotBuilder } from './ProviderUsageSnapshotBuilder';
import { ProviderUsageSnapshot } from './ProviderUsageTrackerTypes';
import { ProviderUsageRecord } from './ProviderUsageTypes';
import { RateLimitWindow } from './ProviderRateLimitTypes';
import { IEventBus } from '../../events/IEventBus';

export class ProviderUsageTracker {
  private collector = new ProviderUsageMetricsCollector();
  private bucketManager = new ProviderUsageBucketManager();
  private readonly standardWindows: RateLimitWindow[] = ['SECOND', 'MINUTE', 'HOUR', 'DAY', 'MONTH'];

  constructor(private eventBus?: IEventBus) {}

  recordRequestStart(providerId: string, _requestId: string, modelId?: string): void {
    this.collector.recordRequestStart(providerId);
    if (modelId) {
      this.collector.recordRequestStart(`${providerId}:${modelId}`);
    }
  }

  recordRequestSuccess(record: ProviderUsageRecord, modelId?: string): void {
    this.collector.recordRequestSuccess(record.providerId, record);
    if (modelId) {
      const modelKey = `${record.providerId}:${modelId}`;
      this.collector.recordRequestSuccess(modelKey, record);
    }

    this.standardWindows.forEach(win => {
      const bucket = this.bucketManager.getOrCreateBucket(record.providerId, win);
      this.bucketManager.recordUsage(bucket, record, true);

      if (modelId) {
        const modelKey = `${record.providerId}:${modelId}`;
        const modelBucket = this.bucketManager.getOrCreateBucket(modelKey, win);
        this.bucketManager.recordUsage(modelBucket, record, true);
      }
    });

    if (this.eventBus) {
      this.eventBus.publish('provider.usage_recorded', {
        providerId: record.providerId,
        modelId,
        requestId: record.requestId,
        success: true,
        durationMs: record.durationMs,
        timestamp: Date.now()
      });
    }
  }

  recordRequestFailure(record: ProviderUsageRecord, modelId?: string): void {
    this.collector.recordRequestFailure(record.providerId, record);
    if (modelId) {
      const modelKey = `${record.providerId}:${modelId}`;
      this.collector.recordRequestFailure(modelKey, record);
    }

    this.standardWindows.forEach(win => {
      const bucket = this.bucketManager.getOrCreateBucket(record.providerId, win);
      this.bucketManager.recordUsage(bucket, record, false);

      if (modelId) {
        const modelKey = `${record.providerId}:${modelId}`;
        const modelBucket = this.bucketManager.getOrCreateBucket(modelKey, win);
        this.bucketManager.recordUsage(modelBucket, record, false);
      }
    });

    if (this.eventBus) {
      this.eventBus.publish('provider.usage_recorded', {
        providerId: record.providerId,
        modelId,
        requestId: record.requestId,
        success: false,
        durationMs: record.durationMs,
        timestamp: Date.now()
      });
    }
  }

  recordRetry(providerId: string, modelId?: string): void {
    this.collector.recordRetry(providerId);
    if (modelId) {
      this.collector.recordRetry(`${providerId}:${modelId}`);
    }
  }

  recordFallback(providerId: string, modelId?: string): void {
    this.collector.recordFallback(providerId);
    if (modelId) {
      this.collector.recordFallback(`${providerId}:${modelId}`);
    }
  }

  getSnapshot(providerId: string, modelId?: string): ProviderUsageSnapshot | null {
    const key = modelId ? `${providerId}:${modelId}` : providerId;
    const metrics = this.collector.getOrCreateMetrics(key);
    return ProviderUsageSnapshotBuilder.createSnapshot(providerId, metrics, modelId);
  }

  getBucketSnapshot(
    providerId: string,
    window: RateLimitWindow,
    customWindowMs?: number,
    modelId?: string
  ): ProviderUsageSnapshot | null {
    const key = modelId ? `${providerId}:${modelId}` : providerId;
    const bucket = this.bucketManager.getOrCreateBucket(key, window, Date.now(), customWindowMs);
    return ProviderUsageSnapshotBuilder.createSnapshot(providerId, bucket.metrics, modelId, window);
  }

  resetProvider(providerId: string): void {
    this.collector.resetEntity(providerId);
    if (this.eventBus) {
      this.eventBus.publish('provider.usage_reset', { providerId, timestamp: Date.now() });
    }
  }

  resetAll(): void {
    this.collector.clear();
    this.bucketManager.clear();
    if (this.eventBus) {
      this.eventBus.publish('provider.usage_reset', { providerId: '*', timestamp: Date.now() });
    }
  }
}
