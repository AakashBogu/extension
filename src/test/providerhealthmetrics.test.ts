import { describe, it, expect } from 'vitest';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';

describe('Module 6F.7: ProviderHealthMetrics', () => {
  it('should calculate success rate, failure rate, and consecutive counters', () => {
    const manager = new ProviderHealthManager();

    manager.recordSuccess('ai.gemini', 100);
    manager.recordSuccess('ai.gemini', 200);
    manager.recordFailure('ai.gemini', 'Error 1');

    const metrics = manager.getMetrics('ai.gemini');
    expect(metrics.totalRequests).toBe(3);
    expect(metrics.successfulRequests).toBe(2);
    expect(metrics.failedRequests).toBe(1);
    expect(metrics.successRate).toBeCloseTo(0.6667, 2);
    expect(metrics.consecutiveFailures).toBe(1);
    expect(metrics.consecutiveSuccesses).toBe(0);
    expect(metrics.averageLatencyMs).toBe(150);
  });
});
