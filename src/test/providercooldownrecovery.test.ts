import { describe, it, expect } from 'vitest';
import { ProviderCooldownRecoveryManager } from '../core/providers/limits/ProviderCooldownRecoveryManager';
import { ExtendedProviderCooldownState } from '../core/providers/limits/ProviderCooldownState';

describe('Module 6F.5: ProviderCooldownRecoveryManager', () => {
  it('should detect when recovery is due and manage timers', () => {
    const recovery = new ProviderCooldownRecoveryManager();
    const expiredState: ExtendedProviderCooldownState = {
      providerId: 'search.brave',
      inCooldown: true,
      status: 'ACTIVE',
      reason: 'Testing',
      startedAt: Date.now() - 2000,
      expiresAt: Date.now() - 100,
      durationMs: 1000,
      source: 'LOCAL_POLICY',
      consecutiveFailureCount: 1,
      recoveryAttempts: 0,
      createdAt: Date.now() - 2000,
      updatedAt: Date.now() - 2000
    };

    expect(recovery.isRecoveryDue(expiredState)).toBe(true);
  });
});
