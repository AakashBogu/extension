import { describe, it, expect } from 'vitest';
import { ProviderAdmissionController } from '../core/providers/limits/ProviderAdmissionController';
import { ProviderRateLimitStateTracker } from '../core/providers/limits/ProviderRateLimitStateTracker';
import { ProviderUsageTracker } from '../core/providers/limits/ProviderUsageTracker';

describe('Module 6F.4: Cooldown Admission Evaluation', () => {
  it('should reject request with COOLDOWN during active cooldown and allow after expiry', () => {
    const usage = new ProviderUsageTracker();
    const rateLimit = new ProviderRateLimitStateTracker(usage);
    const controller = new ProviderAdmissionController(rateLimit, usage);

    controller.setProviderCooldown('ai.gemini', {
      providerId: 'ai.gemini',
      inCooldown: true,
      reason: 'Vendor 429',
      expiresAt: Date.now() + 5000
    });

    const request = { requestId: 'r1', correlationId: 'c1', operation: 'CLAIM_ANALYSIS' as const, input: 'test', createdAt: Date.now() };
    const result = controller.evaluate(request, 'ai.gemini');

    expect(result.decision).toBe('COOLDOWN');

    // Expire cooldown
    controller.setProviderCooldown('ai.gemini', {
      providerId: 'ai.gemini',
      inCooldown: false,
      reason: 'Expired'
    });

    const result2 = controller.evaluate(request, 'ai.gemini');
    expect(result2.decision).toBe('ALLOWED');
  });
});
