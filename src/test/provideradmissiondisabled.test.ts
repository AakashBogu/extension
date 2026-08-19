import { describe, it, expect } from 'vitest';
import { ProviderAdmissionController } from '../core/providers/limits/ProviderAdmissionController';
import { ProviderRateLimitStateTracker } from '../core/providers/limits/ProviderRateLimitStateTracker';
import { ProviderUsageTracker } from '../core/providers/limits/ProviderUsageTracker';

describe('Module 6F.4: Disabled Provider Admission', () => {
  it('should reject request with DISABLED when provider is disabled', () => {
    const usage = new ProviderUsageTracker();
    const rateLimit = new ProviderRateLimitStateTracker(usage);
    const controller = new ProviderAdmissionController(rateLimit, usage);

    controller.setProviderEnabled('ai.openai', false);

    const request = { requestId: 'r1', correlationId: 'c1', operation: 'CLAIM_ANALYSIS' as const, input: 'test', createdAt: Date.now() };
    const result = controller.evaluate(request, 'ai.openai');

    expect(result.decision).toBe('DISABLED');
  });
});
