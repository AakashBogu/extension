import { describe, it, expect } from 'vitest';
import { ProviderReliabilityRecoveryManager } from '../core/providers/recovery/ProviderReliabilityRecoveryManager';

describe('Module 6F.9: Bounded Memory & Reliable Accounting', () => {
  it('should maintain bounded rolling sample count (200 max)', () => {
    const manager = new ProviderReliabilityRecoveryManager();

    for (let i = 0; i < 250; i++) {
      manager.recordSuccess('ai.p6');
    }

    const rec = manager.getCircuitRecord('ai.p6');
    expect(rec.rollingSampleCount).toBeLessThanOrEqual(200);
  });
});
