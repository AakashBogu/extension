import { describe, it, expect } from 'vitest';
import { ProviderCooldownEvaluator } from '../core/providers/limits/ProviderCooldownEvaluator';
import { ProviderCooldownPolicy } from '../core/providers/limits/ProviderCooldownPolicy';

describe('Module 6F.5: Retry-After Normalization', () => {
  it('should select conservative duration when Retry-After is longer than base duration', () => {
    const policy = new ProviderCooldownPolicy({ baseDurationMs: 2000, maxDurationMs: 60000 });
    const bounds = ProviderCooldownEvaluator.determineExpiration('RETRY_AFTER', 15000, 1, policy);

    expect(bounds.durationMs).toBe(15000);
  });
});
