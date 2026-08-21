import { describe, it, expect } from 'vitest';
import { ProviderReliabilityRecoveryManager } from '../core/providers/recovery/ProviderReliabilityRecoveryManager';

describe('Module 6F.9: Bounded Recovery Probes', () => {
  it('should allow only one recovery probe concurrently during HALF_OPEN state', () => {
    const manager = new ProviderReliabilityRecoveryManager();
    for (let i = 0; i < 5; i++) manager.recordFailure('ai.p3', 'Outage');

    const rec = manager.getCircuitRecord('ai.p3');
    Object.defineProperty(rec, 'state', { value: 'HALF_OPEN', writable: true });

    expect(manager.canProbe('ai.p3')).toBe(true);
    const probeId1 = manager.startProbe('ai.p3');
    expect(probeId1).not.toBeNull();

    // Second concurrent probe should be denied!
    expect(manager.canProbe('ai.p3')).toBe(false);
  });
});
