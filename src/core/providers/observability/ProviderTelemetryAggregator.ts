/**
 * Provider Telemetry Aggregator (Module 6F.10)
 *
 * Computes time-windowed aggregations from raw telemetry records.
 * Uses a fixed-size bucket model with automatic eviction of old buckets,
 * following the bounded data structure conventions established by
 * ProviderUsageBucketManager.
 */

import {
  TelemetryRecord,
  TelemetryAggregation,
  TelemetryAggregationWindow,
  TelemetryAccumulator,
} from './ProviderTelemetryTypes';
import { ProviderTelemetryPolicy } from './ProviderTelemetryPolicy';

export class ProviderTelemetryAggregator {
  /**
   * Aggregation buckets keyed by `${providerId}:${windowStart}`.
   * Bounded by maxAggregationBucketsPerProvider × number of providers.
   */
  private buckets = new Map<string, TelemetryAccumulator>();
  private providerBucketCounts = new Map<string, number>();

  constructor(
    private readonly policy: ProviderTelemetryPolicy = new ProviderTelemetryPolicy()
  ) {}

  // ─── Public API ─────────────────────────────────────────────────────

  /**
   * Aggregate an array of telemetry records into the current window.
   */
  aggregateRecords(records: ReadonlyArray<TelemetryRecord>): void {
    for (const record of records) {
      this.ingestRecord(record);
    }
  }

  /**
   * Get the most recent completed aggregation for a provider.
   */
  getLatestAggregation(providerId: string): TelemetryAggregation | null {
    const windowMs = this.policy.defaultAggregationWindowMs;
    const now = Date.now();
    // Look for the most recent completed window
    const currentWindowStart = Math.floor(now / windowMs) * windowMs;
    const previousWindowStart = currentWindowStart - windowMs;

    const previousKey = `${providerId}:${previousWindowStart}`;
    const previousBucket = this.buckets.get(previousKey);
    if (previousBucket) {
      return this.finalizeAccumulator(previousBucket);
    }

    // Fall back to current (in-progress) window
    const currentKey = `${providerId}:${currentWindowStart}`;
    const currentBucket = this.buckets.get(currentKey);
    if (currentBucket) {
      return this.finalizeAccumulator(currentBucket);
    }

    return null;
  }

  /**
   * Get all aggregations for a provider.
   */
  getAggregations(providerId: string): TelemetryAggregation[] {
    const results: TelemetryAggregation[] = [];

    for (const [key, acc] of this.buckets.entries()) {
      if (key.startsWith(`${providerId}:`)) {
        results.push(this.finalizeAccumulator(acc));
      }
    }

    return results.sort((a, b) => a.windowStart - b.windowStart);
  }

  /**
   * Get aggregations for a provider within a time range.
   */
  getAggregationsInRange(
    providerId: string,
    startTime: number,
    endTime: number
  ): TelemetryAggregation[] {
    return this.getAggregations(providerId).filter(
      a => a.windowStart >= startTime && a.windowEnd <= endTime
    );
  }

  /**
   * Get all tracked provider IDs.
   */
  getTrackedProviders(): string[] {
    return Array.from(this.providerBucketCounts.keys());
  }

  /**
   * Clear all aggregation data.
   */
  clear(providerId?: string): void {
    if (providerId) {
      const keysToDelete: string[] = [];
      for (const key of this.buckets.keys()) {
        if (key.startsWith(`${providerId}:`)) {
          keysToDelete.push(key);
        }
      }
      for (const key of keysToDelete) {
        this.buckets.delete(key);
      }
      this.providerBucketCounts.delete(providerId);
    } else {
      this.buckets.clear();
      this.providerBucketCounts.clear();
    }
  }

  /**
   * Reset all state (alias for clear).
   */
  reset(): void {
    this.clear();
  }

  /**
   * Destroy and release all resources.
   */
  destroy(): void {
    this.clear();
  }

  // ─── Internal: Record Ingestion ────────────────────────────────────

  private ingestRecord(record: TelemetryRecord): void {
    const windowMs = this.policy.defaultAggregationWindowMs;
    const windowStart = Math.floor(record.timestamp / windowMs) * windowMs;
    const windowEnd = windowStart + windowMs;
    const bucketKey = `${record.providerId}:${windowStart}`;

    let acc = this.buckets.get(bucketKey);
    if (!acc) {
      acc = this.createAccumulator(record.providerId, windowStart, windowEnd);
      this.buckets.set(bucketKey, acc);

      // Track bucket count per provider and enforce retention
      const currentCount = (this.providerBucketCounts.get(record.providerId) ?? 0) + 1;
      this.providerBucketCounts.set(record.providerId, currentCount);

      if (currentCount > this.policy.maxAggregationBucketsPerProvider) {
        this.evictOldestBucket(record.providerId);
      }
    }

    this.applyRecord(acc, record);
  }

  private applyRecord(acc: TelemetryAccumulator, record: TelemetryRecord): void {
    switch (record.category) {
      case 'USAGE':
      case 'EXECUTION':
        acc.totalRequests++;
        if (record.success === true) {
          acc.successfulRequests++;
        } else if (record.success === false) {
          acc.failedRequests++;
        }
        if (record.durationMs !== undefined && record.durationMs >= 0) {
          acc.totalLatencyMs += record.durationMs;
          acc.latencySampleCount++;
          if (record.durationMs < acc.minLatencyMs) acc.minLatencyMs = record.durationMs;
          if (record.durationMs > acc.maxLatencyMs) acc.maxLatencyMs = record.durationMs;
        }
        break;

      case 'ADMISSION':
        acc.totalAdmissions++;
        if (record.success === true) {
          acc.admissionsAllowed++;
        } else if (record.success === false) {
          acc.admissionsDenied++;
        }
        break;

      case 'ROUTING':
        if (record.decision === 'FALLBACK') {
          acc.fallbackSelections++;
        } else {
          acc.routingSelections++;
        }
        break;

      case 'RATE_LIMIT':
        if (record.isExhausted) {
          acc.rateLimitEvents++;
        }
        break;

      case 'QUOTA':
        if (record.isExhausted) {
          acc.quotaExhaustionEvents++;
        }
        break;

      case 'COOLDOWN':
        acc.cooldownEvents++;
        break;

      case 'CIRCUIT':
        if (record.decision === 'OPEN') {
          acc.circuitOpenEvents++;
        }
        break;

      case 'HEALTH':
      case 'RECOVERY':
        // Health and recovery events are tracked as records but do not
        // increment specific aggregation counters — they are captured
        // via direct state queries in diagnostics.
        break;
    }
  }

  // ─── Internal: Accumulator Lifecycle ───────────────────────────────

  private createAccumulator(
    providerId: string,
    windowStart: number,
    windowEnd: number
  ): TelemetryAccumulator {
    return {
      providerId,
      window: 'MINUTE' as TelemetryAggregationWindow,
      windowStart,
      windowEnd,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalLatencyMs: 0,
      minLatencyMs: Infinity,
      maxLatencyMs: 0,
      latencySampleCount: 0,
      totalAdmissions: 0,
      admissionsAllowed: 0,
      admissionsDenied: 0,
      routingSelections: 0,
      fallbackSelections: 0,
      rateLimitEvents: 0,
      quotaExhaustionEvents: 0,
      cooldownEvents: 0,
      circuitOpenEvents: 0,
    };
  }

  private finalizeAccumulator(acc: TelemetryAccumulator): TelemetryAggregation {
    const totalRequestsDenom = acc.totalRequests || 1;
    const admissionsDenom = acc.totalAdmissions || 1;

    return {
      providerId: acc.providerId,
      window: acc.window,
      windowStart: acc.windowStart,
      windowEnd: acc.windowEnd,

      totalRequests: acc.totalRequests,
      successfulRequests: acc.successfulRequests,
      failedRequests: acc.failedRequests,
      successRate: acc.totalRequests > 0
        ? Number((acc.successfulRequests / totalRequestsDenom).toFixed(4))
        : 0,

      averageLatencyMs: acc.latencySampleCount > 0
        ? Math.round(acc.totalLatencyMs / acc.latencySampleCount)
        : 0,
      minLatencyMs: acc.latencySampleCount > 0 ? acc.minLatencyMs : 0,
      maxLatencyMs: acc.maxLatencyMs,

      totalAdmissions: acc.totalAdmissions,
      admissionsAllowed: acc.admissionsAllowed,
      admissionsDenied: acc.admissionsDenied,
      admissionDenialRate: acc.totalAdmissions > 0
        ? Number((acc.admissionsDenied / admissionsDenom).toFixed(4))
        : 0,

      routingSelections: acc.routingSelections,
      fallbackSelections: acc.fallbackSelections,

      rateLimitEvents: acc.rateLimitEvents,
      quotaExhaustionEvents: acc.quotaExhaustionEvents,
      cooldownEvents: acc.cooldownEvents,
      circuitOpenEvents: acc.circuitOpenEvents,
    };
  }

  // ─── Internal: Eviction ────────────────────────────────────────────

  private evictOldestBucket(providerId: string): void {
    let oldestKey: string | null = null;
    let oldestStart = Infinity;

    for (const [key, acc] of this.buckets.entries()) {
      if (key.startsWith(`${providerId}:`) && acc.windowStart < oldestStart) {
        oldestStart = acc.windowStart;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.buckets.delete(oldestKey);
      const count = this.providerBucketCounts.get(providerId) ?? 1;
      this.providerBucketCounts.set(providerId, count - 1);
    }
  }
}
