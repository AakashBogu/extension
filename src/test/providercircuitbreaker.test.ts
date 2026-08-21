import { describe, it, expect } from 'vitest';
import { ProviderReliabilityRecoveryManager } from '../core/providers/recovery/ProviderReliabilityRecoveryManager';

describe('Module 6F.9: Circuit Breaker Baseline', () => {
  it('should start in CLOSED state and remain CLOSED on single failure', () => {
    const manager = new ProviderReliabilityRecoveryManager();
    expect(manager.getCircuitState('ai.openai')).toBe('CLOSED');

    manager.recordFailure('ai.openai', 'HTTP 500 error');
    expect(manager.getCircuitState('ai.openai')).toBe('CLOSED');
  });
});
