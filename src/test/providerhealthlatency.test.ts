import { describe, it, expect } from 'vitest';
import { ProviderLatencyTracker } from '../core/providers/health/ProviderLatencyTracker';

describe('Module 6F.7: ProviderLatencyTracker (Bounded Memory Ring Buffer)', () => {
  it('should bound latency samples and compute p50 / p95 percentiles', () => {
    const tracker = new ProviderLatencyTracker(5); // max 5 samples

    for (let i = 1; i <= 10; i++) {
      tracker.recordLatency('ai.openai', i * 100);
    }

    // Only last 5 samples remain: 600, 700, 800, 900, 1000
    expect(tracker.getAverageLatency('ai.openai')).toBe(800);
    expect(tracker.getPercentileLatency('ai.openai', 50)).toBe(800);
    expect(tracker.getPercentileLatency('ai.openai', 95)).toBe(1000);
  });
});
