import { describe, it, expect } from 'vitest';
import { ProviderReliabilityRecoveryManager } from '../core/providers/recovery/ProviderReliabilityRecoveryManager';

describe('Module 6F.9: State Transitions (CLOSED -> OPEN -> HALF_OPEN)', () => {
  it('should transition to OPEN when failureThreshold (5) is reached', () => {
    const manager = new ProviderReliabilityRecoveryManager();

    for (let i = 0; i < 5; i++) {
      manager.recordFailure('ai.p1', 'Server Error');
    }

    expect(manager.getCircuitState('ai.p1')).toBe('OPEN');
  });
});
