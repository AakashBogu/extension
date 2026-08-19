import { describe, it, expect } from 'vitest';
import { ProviderAdmissionController } from '../core/providers/limits/ProviderAdmissionController';
import { ProviderRateLimitStateTracker } from '../core/providers/limits/ProviderRateLimitStateTracker';
import { ProviderUsageTracker } from '../core/providers/limits/ProviderUsageTracker';

describe('Module 6F.4: ProviderAdmissionController', () => {
  it('should admit normal ALLOWED requests and track evaluation statistics', async () => {
    const usage = new ProviderUsageTracker();
    const rateLimit = new ProviderRateLimitStateTracker(usage);
    const controller = new ProviderAdmissionController(rateLimit, usage);
    await controller.initialize();

    const request = { requestId: 'r1', correlationId: 'c1', operation: 'CLAIM_ANALYSIS' as const, input: 'test', createdAt: Date.now() };
    const result = controller.evaluate(request, 'ai.openai');

    expect(result.decision).toBe('ALLOWED');
    expect(controller.canExecute(request, 'ai.openai')).toBe(true);

    const status = controller.getStatus();
    expect(status.totalEvaluations).toBe(2);
    expect(status.totalAllowed).toBe(2);
  });
});
