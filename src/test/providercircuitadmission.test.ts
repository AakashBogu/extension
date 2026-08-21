import { describe, it, expect } from 'vitest';
import { ProviderReliabilityRecoveryManager } from '../core/providers/recovery/ProviderReliabilityRecoveryManager';

describe('Module 6F.9: Admission Controller Circuit Integration', () => {
  it('should deny normal admission requests when circuit state is OPEN', () => {
    const manager = new ProviderReliabilityRecoveryManager();
    for (let i = 0; i < 5; i++) manager.recordFailure('ai.p4', 'Service Unavailable');

    const admission = manager.evaluateAdmission('ai.p4', false);
    expect(admission.allowed).toBe(false);
    expect(admission.decision).toBe('CIRCUIT_OPEN');
  });
});
