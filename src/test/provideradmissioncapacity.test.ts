import { describe, it, expect } from 'vitest';
import { ProviderAdmissionController } from '../core/providers/limits/ProviderAdmissionController';
import { ProviderRateLimitStateTracker } from '../core/providers/limits/ProviderRateLimitStateTracker';
import { ProviderUsageTracker } from '../core/providers/limits/ProviderUsageTracker';

describe('Module 6F.4: Capacity Admission Evaluation', () => {
  it('should reject request with CAPACITY_EXCEEDED when concurrent capacity is full', () => {
    const usage = new ProviderUsageTracker();
    const rateLimit = new ProviderRateLimitStateTracker(usage);
    const controller = new ProviderAdmissionController(rateLimit, usage);

    const request = { requestId: 'r1', correlationId: 'c1', operation: 'CLAIM_ANALYSIS' as const, input: 'test', createdAt: Date.now() };
    const result = controller.evaluate(request, 'ai.openai', 10, 10);

    expect(result.decision).toBe('CAPACITY_EXCEEDED');
  });
});
