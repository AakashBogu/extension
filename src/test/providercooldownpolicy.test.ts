import { describe, it, expect } from 'vitest';
import { ProviderCooldownPolicy } from '../core/providers/limits/ProviderCooldownPolicy';

describe('Module 6F.5: ProviderCooldownPolicy Configuration', () => {
  it('should apply conservative default settings', () => {
    const policy = new ProviderCooldownPolicy();
    expect(policy.enabled).toBe(true);
    expect(policy.baseDurationMs).toBe(5000);
    expect(policy.maxDurationMs).toBe(300000);
    expect(policy.backoffFactor).toBe(2.0);
  });
});
