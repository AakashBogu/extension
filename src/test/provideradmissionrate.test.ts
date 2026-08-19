import { describe, it, expect } from 'vitest';
import { ProviderAdmissionController } from '../core/providers/limits/ProviderAdmissionController';
import { ProviderRateLimitStateTracker } from '../core/providers/limits/ProviderRateLimitStateTracker';
import { ProviderUsageTracker } from '../core/providers/limits/ProviderUsageTracker';
import { ProviderLimitPolicy } from '../core/providers/limits/ProviderLimitPolicy';

describe('Module 6F.4: Rate-Limit Admission Evaluation', () => {
  it('should reject request with RATE_LIMITED when rate limit is exhausted', () => {
    const usage = new ProviderUsageTracker();
    const rateLimit = new ProviderRateLimitStateTracker(usage);
    const controller = new ProviderAdmissionController(rateLimit, usage);

    rateLimit.configureProviderLimits('ai.openai', new ProviderLimitPolicy({
      limits: [{ dimension: 'REQUESTS', window: 'MINUTE', limit: 1 }]
    }));

    usage.recordRequestSuccess({ recordId: 'u1', providerId: 'ai.openai', requestId: 'r1', requestCount: 1, durationMs: 10, timestamp: Date.now() });

    const request = { requestId: 'r2', correlationId: 'c1', operation: 'CLAIM_ANALYSIS' as const, input: 'test', createdAt: Date.now() };
    const result = controller.evaluate(request, 'ai.openai');

    expect(result.decision).toBe('RATE_LIMITED');
    expect(result.reason).toContain('Rate limit');
  });
});
