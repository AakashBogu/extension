import { describe, it, expect } from 'vitest';
import { ProviderUsageTracker } from '../core/providers/limits/ProviderUsageTracker';
import { ProviderRateLimitStateTracker } from '../core/providers/limits/ProviderRateLimitStateTracker';
import { ProviderLimitPolicy } from '../core/providers/limits/ProviderLimitPolicy';
import { ExtendedRateLimitState } from '../core/providers/limits/ProviderRateLimitStateTypes';

describe('Module 6F.3: ProviderRateLimitStateTracker', () => {
  it('should track multiple simultaneous limits per provider and calculate remaining capacity', () => {
    const usageTracker = new ProviderUsageTracker();
    const stateTracker = new ProviderRateLimitStateTracker(usageTracker);

    const policy = new ProviderLimitPolicy({
      limits: [
        { dimension: 'REQUESTS', window: 'MINUTE', limit: 60 },
        { dimension: 'TOKENS', window: 'DAY', limit: 100000 }
      ]
    });

    stateTracker.configureProviderLimits('ai.openai', policy);

    // Record usage
    usageTracker.recordRequestStart('ai.openai', 'req_1');
    usageTracker.recordRequestSuccess({
      recordId: 'rec_1',
      providerId: 'ai.openai',
      requestId: 'req_1',
      requestCount: 1,
      totalTokens: 15000,
      durationMs: 120,
      timestamp: Date.now()
    });

    const snapshot = stateTracker.refreshProvider('ai.openai');
    expect(snapshot.providerId).toBe('ai.openai');
    expect(snapshot.limits).toHaveLength(2);

    const reqLimit = snapshot.limits[0] as ExtendedRateLimitState;
    expect(reqLimit.currentUsage).toBe(1);
    expect(reqLimit.remainingCapacity).toBe(59);

    const tokenLimit = snapshot.limits[1] as ExtendedRateLimitState;
    expect(tokenLimit.currentUsage).toBe(15000);
    expect(tokenLimit.remainingCapacity).toBe(85000);
  });

  it('should identify limiting states when limits are exhausted', () => {
    const usageTracker = new ProviderUsageTracker();
    const stateTracker = new ProviderRateLimitStateTracker(usageTracker);

    const policy = new ProviderLimitPolicy({
      limits: [
        { dimension: 'REQUESTS', window: 'MINUTE', limit: 2 }
      ]
    });

    stateTracker.configureProviderLimits('search.brave', policy);

    usageTracker.recordRequestSuccess({ recordId: 'r1', providerId: 'search.brave', requestId: 'r1', requestCount: 1, durationMs: 10, timestamp: Date.now() });
    usageTracker.recordRequestSuccess({ recordId: 'r2', providerId: 'search.brave', requestId: 'r2', requestCount: 1, durationMs: 10, timestamp: Date.now() });

    stateTracker.refreshProvider('search.brave');
    const limiting = stateTracker.getLimitingStates('search.brave');

    expect(limiting).toHaveLength(1);
    expect((limiting[0] as ExtendedRateLimitState).isExhausted).toBe(true);
    expect((limiting[0] as ExtendedRateLimitState).level).toBe('EXHAUSTED');
  });
});
