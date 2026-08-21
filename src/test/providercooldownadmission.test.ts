import { describe, it, expect } from 'vitest';
import { ProviderAdmissionController } from '../core/providers/limits/ProviderAdmissionController';
import { ProviderCooldownManager } from '../core/providers/limits/ProviderCooldownManager';
import { ProviderRateLimitStateTracker } from '../core/providers/limits/ProviderRateLimitStateTracker';
import { ProviderUsageTracker } from '../core/providers/limits/ProviderUsageTracker';

describe('Module 6F.5: Cooldown Admission Controller Integration', () => {
  it('should block admission during active cooldown and allow after clearing', () => {
    const usage = new ProviderUsageTracker();
    const rateLimit = new ProviderRateLimitStateTracker(usage);
    const cooldownManager = new ProviderCooldownManager();
    const controller = new ProviderAdmissionController(rateLimit, usage, undefined, cooldownManager);

    cooldownManager.startCooldown('ai.openai', 'LOCAL_POLICY', 'Error 503');

    const request = { requestId: 'r1', correlationId: 'c1', operation: 'CLAIM_ANALYSIS' as const, input: 'test', createdAt: Date.now() };
    const result = controller.evaluate(request, 'ai.openai');

    expect(result.decision).toBe('COOLDOWN');

    cooldownManager.clearCooldown('ai.openai');
    const result2 = controller.evaluate(request, 'ai.openai');
    expect(result2.decision).toBe('ALLOWED');
  });
});
