import { describe, it, expect } from 'vitest';
import { ProviderReliabilityRecoveryManager } from '../core/providers/recovery/ProviderReliabilityRecoveryManager';

describe('Module 6F.9: Recovery Backoff & State Clearing', () => {
  it('should reset circuit state when probe succeeds in HALF_OPEN state', () => {
    const manager = new ProviderReliabilityRecoveryManager();
    for (let i = 0; i < 5; i++) manager.recordFailure('search.bing', 'Connection reset');

    expect(manager.getCircuitState('search.bing')).toBe('OPEN');

    // Force HALF_OPEN state transition simulation
    const rec = manager.getCircuitRecord('search.bing');
    Object.defineProperty(rec, 'state', { value: 'HALF_OPEN', writable: true });

    manager.recordSuccess('search.bing');
    expect(manager.getCircuitState('search.bing')).toBe('CLOSED');
  });
});
