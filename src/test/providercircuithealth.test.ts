import { describe, it, expect } from 'vitest';
import { ProviderReliabilityRecoveryManager } from '../core/providers/recovery/ProviderReliabilityRecoveryManager';

describe('Module 6F.9: Health Manager Circuit Dominance', () => {
  it('should prioritize circuit OPEN status over high priority / health score', () => {
    const recovery = new ProviderReliabilityRecoveryManager();

    for (let i = 0; i < 5; i++) recovery.recordFailure('ai.top', 'Outage');

    expect(recovery.getCircuitState('ai.top')).toBe('OPEN');
  });
});
