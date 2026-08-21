import { describe, it, expect } from 'vitest';
import { ProviderReliabilityRecoveryManager } from '../core/providers/recovery/ProviderReliabilityRecoveryManager';

describe('Module 6F.9: Rolling Failure Rate Triggering', () => {
  it('should transition to OPEN when rolling failure rate threshold (0.60) is exceeded', () => {
    const manager = new ProviderReliabilityRecoveryManager();

    // 3 successes, 7 failures = 70% failure rate (> 60% threshold over 10 samples)
    for (let i = 0; i < 3; i++) manager.recordSuccess('ai.p2');
    for (let i = 0; i < 7; i++) manager.recordFailure('ai.p2', 'Timeout');

    expect(manager.getCircuitState('ai.p2')).toBe('OPEN');
  });
});
