import { describe, it, expect } from 'vitest';
import { ProviderCooldownEvaluator } from '../core/providers/limits/ProviderCooldownEvaluator';
import { ProviderCooldownPolicy } from '../core/providers/limits/ProviderCooldownPolicy';
import { ProviderRateLimitError } from '../core/error/ProviderLimitErrors';

describe('Module 6F.5: ProviderCooldownEvaluator', () => {
  it('should classify rate limit error and determine expiration bounds', () => {
    const policy = new ProviderCooldownPolicy({ baseDurationMs: 5000, maxDurationMs: 60000 });
    const err = new ProviderRateLimitError('Rate limited', { providerId: 'ai.gemini', retryAfterMs: 10000 });

    const classification = ProviderCooldownEvaluator.classifyError(err, policy);
    expect(classification.shouldCooldown).toBe(true);
    expect(classification.source).toBe('RETRY_AFTER');

    const bounds = ProviderCooldownEvaluator.determineExpiration(classification.source, classification.retryAfterMs, 1, policy);
    expect(bounds.durationMs).toBe(10000);
  });
});
