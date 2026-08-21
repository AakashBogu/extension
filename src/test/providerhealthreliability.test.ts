import { describe, it, expect } from 'vitest';
import { ProviderReliabilityTracker } from '../core/providers/health/ProviderReliabilityTracker';
import { ProviderLatencyTracker } from '../core/providers/health/ProviderLatencyTracker';

describe('Module 6F.7: ProviderReliabilityTracker', () => {
  it('should track retryable vs non-retryable failures', () => {
    const latency = new ProviderLatencyTracker();
    const reliability = new ProviderReliabilityTracker(latency);

    reliability.recordOutcome('search.brave', 'SUCCESS', 50);
    reliability.recordOutcome('search.brave', 'RETRYABLE_FAILURE');
    reliability.recordOutcome('search.brave', 'NON_RETRYABLE_FAILURE');

    const m = reliability.getMetrics('search.brave');
    expect(m.totalRequests).toBe(3);
    expect(m.retryableFailures).toBe(1);
    expect(m.nonRetryableFailures).toBe(1);
  });
});
