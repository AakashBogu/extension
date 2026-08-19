import { describe, it, expect } from 'vitest';
import { ProviderAdmissionController } from '../core/providers/limits/ProviderAdmissionController';
import { ProviderRateLimitStateTracker } from '../core/providers/limits/ProviderRateLimitStateTracker';
import { ProviderUsageTracker } from '../core/providers/limits/ProviderUsageTracker';
import { ProviderQuotaPolicy } from '../core/providers/limits/ProviderQuotaPolicy';

describe('Module 6F.4: Quota Admission Evaluation', () => {
  it('should reject request with QUOTA_EXHAUSTED when daily request quota is hit', () => {
    const usage = new ProviderUsageTracker();
    const rateLimit = new ProviderRateLimitStateTracker(usage);
    const controller = new ProviderAdmissionController(rateLimit, usage);

    controller.setProviderQuotaPolicy('search.brave', new ProviderQuotaPolicy({
      dailyLimits: { requests: 1 }
    }));

    usage.recordRequestSuccess({ recordId: 'u1', providerId: 'search.brave', requestId: 'r1', requestCount: 1, durationMs: 10, timestamp: Date.now() });

    const request = { requestId: 'r2', correlationId: 'c1', query: 'test', maxResults: 10, createdAt: Date.now() };
    const result = controller.evaluate(request, 'search.brave');

    expect(result.decision).toBe('QUOTA_EXHAUSTED');
  });
});
