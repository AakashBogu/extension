import { describe, it, expect } from 'vitest';
import { ProviderCircuitPolicy } from '../core/providers/recovery/ProviderCircuitPolicy';

describe('Module 6F.9: ProviderCircuitPolicy Validation', () => {
  it('should validate policy limits and configuration options', () => {
    const policy = new ProviderCircuitPolicy({ failureThreshold: 5, openDurationMs: 30000 });
    expect(policy.failureThreshold).toBe(5);
    expect(policy.openDurationMs).toBe(30000);

    expect(() => new ProviderCircuitPolicy({ failureThreshold: -1 })).toThrow();
    expect(() => new ProviderCircuitPolicy({ rollingFailureThreshold: 1.5 })).toThrow();
  });
});
