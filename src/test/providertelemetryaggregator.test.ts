/**
 * Module 6F.10: Provider Telemetry Aggregator Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ProviderTelemetryAggregator } from '../core/providers/observability/ProviderTelemetryAggregator';
import { ProviderTelemetryPolicy } from '../core/providers/observability/ProviderTelemetryPolicy';
import { TelemetryRecord } from '../core/providers/observability/ProviderTelemetryTypes';

describe('Module 6F.10: ProviderTelemetryAggregator', () => {
  let aggregator: ProviderTelemetryAggregator;
  const now = Date.now();
  // Align to current minute window
  const windowMs = 60_000;
  const windowStart = Math.floor(now / windowMs) * windowMs;

  beforeEach(() => {
    aggregator = new ProviderTelemetryAggregator(new ProviderTelemetryPolicy());
  });

  it('should aggregate usage records into per-provider windows', () => {
    const records: TelemetryRecord[] = [
      { id: 'r1', category: 'USAGE', providerId: 'ai.openai', timestamp: windowStart + 1000, success: true, durationMs: 100 },
      { id: 'r2', category: 'USAGE', providerId: 'ai.openai', timestamp: windowStart + 2000, success: true, durationMs: 200 },
      { id: 'r3', category: 'USAGE', providerId: 'ai.openai', timestamp: windowStart + 3000, success: false, durationMs: 50 },
    ];

    aggregator.aggregateRecords(records);

    const agg = aggregator.getLatestAggregation('ai.openai');
    expect(agg).not.toBeNull();
    expect(agg!.totalRequests).toBe(3);
    expect(agg!.successfulRequests).toBe(2);
    expect(agg!.failedRequests).toBe(1);
    expect(agg!.successRate).toBeCloseTo(0.6667, 3);
    expect(agg!.averageLatencyMs).toBe(Math.round((100 + 200 + 50) / 3));
    expect(agg!.minLatencyMs).toBe(50);
    expect(agg!.maxLatencyMs).toBe(200);
  });

  it('should aggregate admission events separately', () => {
    const records: TelemetryRecord[] = [
      { id: 'a1', category: 'ADMISSION', providerId: 'ai.openai', timestamp: windowStart + 1000, success: true, decision: 'ALLOWED' },
      { id: 'a2', category: 'ADMISSION', providerId: 'ai.openai', timestamp: windowStart + 2000, success: false, decision: 'RATE_LIMITED' },
      { id: 'a3', category: 'ADMISSION', providerId: 'ai.openai', timestamp: windowStart + 3000, success: true, decision: 'ALLOWED' },
    ];

    aggregator.aggregateRecords(records);

    const agg = aggregator.getLatestAggregation('ai.openai');
    expect(agg).not.toBeNull();
    expect(agg!.totalAdmissions).toBe(3);
    expect(agg!.admissionsAllowed).toBe(2);
    expect(agg!.admissionsDenied).toBe(1);
    expect(agg!.admissionDenialRate).toBeCloseTo(0.3333, 3);
  });

  it('should aggregate routing and fallback events', () => {
    const records: TelemetryRecord[] = [
      { id: 'rt1', category: 'ROUTING', providerId: 'ai.openai', timestamp: windowStart + 1000 },
      { id: 'rt2', category: 'ROUTING', providerId: 'ai.openai', timestamp: windowStart + 2000 },
      { id: 'rt3', category: 'ROUTING', providerId: 'ai.openai', timestamp: windowStart + 3000, decision: 'FALLBACK' },
    ];

    aggregator.aggregateRecords(records);

    const agg = aggregator.getLatestAggregation('ai.openai');
    expect(agg!.routingSelections).toBe(2);
    expect(agg!.fallbackSelections).toBe(1);
  });

  it('should aggregate limit events', () => {
    const records: TelemetryRecord[] = [
      { id: 'rl1', category: 'RATE_LIMIT', providerId: 'ai.openai', timestamp: windowStart + 1000, isExhausted: true },
      { id: 'q1', category: 'QUOTA', providerId: 'ai.openai', timestamp: windowStart + 2000, isExhausted: true },
      { id: 'cd1', category: 'COOLDOWN', providerId: 'ai.openai', timestamp: windowStart + 3000 },
      { id: 'cb1', category: 'CIRCUIT', providerId: 'ai.openai', timestamp: windowStart + 4000, decision: 'OPEN' },
    ];

    aggregator.aggregateRecords(records);

    const agg = aggregator.getLatestAggregation('ai.openai');
    expect(agg!.rateLimitEvents).toBe(1);
    expect(agg!.quotaExhaustionEvents).toBe(1);
    expect(agg!.cooldownEvents).toBe(1);
    expect(agg!.circuitOpenEvents).toBe(1);
  });

  it('should keep providers isolated', () => {
    const records: TelemetryRecord[] = [
      { id: 'r1', category: 'USAGE', providerId: 'ai.openai', timestamp: windowStart + 1000, success: true },
      { id: 'r2', category: 'USAGE', providerId: 'search.brave', timestamp: windowStart + 2000, success: false },
    ];

    aggregator.aggregateRecords(records);

    const openai = aggregator.getLatestAggregation('ai.openai');
    expect(openai!.totalRequests).toBe(1);
    expect(openai!.successfulRequests).toBe(1);

    const brave = aggregator.getLatestAggregation('search.brave');
    expect(brave!.totalRequests).toBe(1);
    expect(brave!.failedRequests).toBe(1);
  });

  it('should evict oldest buckets when exceeding max per provider', () => {
    const smallPolicy = new ProviderTelemetryPolicy({ maxAggregationBucketsPerProvider: 3, defaultAggregationWindowMs: 1000 });
    const smallAgg = new ProviderTelemetryAggregator(smallPolicy);

    // Create records spanning 5 different 1-second windows
    for (let i = 0; i < 5; i++) {
      smallAgg.aggregateRecords([{
        id: `r${i}`,
        category: 'USAGE',
        providerId: 'ai.openai',
        timestamp: windowStart + (i * 1000) + 100,
        success: true,
      }]);
    }

    const allAggs = smallAgg.getAggregations('ai.openai');
    expect(allAggs.length).toBeLessThanOrEqual(3);
  });

  it('should return null for unknown provider', () => {
    expect(aggregator.getLatestAggregation('nonexistent')).toBeNull();
  });

  it('should clear and destroy properly', () => {
    aggregator.aggregateRecords([
      { id: 'r1', category: 'USAGE', providerId: 'ai.openai', timestamp: windowStart + 1000, success: true },
    ]);

    aggregator.clear('ai.openai');
    expect(aggregator.getLatestAggregation('ai.openai')).toBeNull();

    aggregator.aggregateRecords([
      { id: 'r2', category: 'USAGE', providerId: 'search.brave', timestamp: windowStart + 1000, success: true },
    ]);

    aggregator.destroy();
    expect(aggregator.getLatestAggregation('search.brave')).toBeNull();
  });
});
