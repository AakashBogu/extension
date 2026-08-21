import { describe, it, expect } from 'vitest';
import { ProviderCooldownEvaluator } from '../core/providers/limits/ProviderCooldownEvaluator';
import { ProviderCooldownPolicy } from '../core/providers/limits/ProviderCooldownPolicy';

describe('Module 6F.5: Exponential Backoff & Max Clamp', () => {
  it('should escalate cooldown duration exponentially and clamp to maxDurationMs', () => {
    const policy = new ProviderCooldownPolicy({ baseDurationMs: 1000, maxDurationMs: 5000, backoffFactor: 2.0 });

    expect(ProviderCooldownEvaluator.calculateBackoffDuration(1, policy)).toBe(1000);
    expect(ProviderCooldownEvaluator.calculateBackoffDuration(2, policy)).toBe(2000);
    expect(ProviderCooldownEvaluator.calculateBackoffDuration(3, policy)).toBe(4000);
    expect(ProviderCooldownEvaluator.calculateBackoffDuration(4, policy)).toBe(5000); // Clamped
  });
});
