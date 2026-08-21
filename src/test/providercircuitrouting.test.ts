import { describe, it, expect } from 'vitest';
import { ProviderReliabilityRecoveryManager } from '../core/providers/recovery/ProviderReliabilityRecoveryManager';

describe('Module 6F.9: Router Circuit OPEN Filtering', () => {
  it('should exclude OPEN circuit providers from router candidate selection', async () => {
    const recovery = new ProviderReliabilityRecoveryManager();

    for (let i = 0; i < 5; i++) recovery.recordFailure('ai.p1', 'Repeated failure');

    expect(recovery.getCircuitState('ai.p1')).toBe('OPEN');
  });
});
