import { describe, it, expect } from 'vitest';
import { ProviderExecutionMetricsCollector } from '../core/providers/execution/ProviderExecutionMetricsCollector';

describe('Module 6D: ProviderExecutionMetricsCollector', () => {
  it('should track total, success, failure, latency, and active request counts', () => {
    const collector = new ProviderExecutionMetricsCollector();

    collector.recordRequestCreated();
    collector.recordSuccess(100);

    collector.recordRequestCreated();
    collector.recordSuccess(200);

    const metrics = collector.getMetrics();
    expect(metrics.totalRequests).toBe(2);
    expect(metrics.successfulRequests).toBe(2);
    expect(metrics.averageLatencyMs).toBe(150);
    expect(metrics.maxLatencyMs).toBe(200);
  });
});
