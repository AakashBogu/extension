import { describe, it, expect } from 'vitest';
import { ClaimDetectionRecoveryManager } from '../core/claims/recovery/ClaimDetectionRecoveryManager';

describe('Module 5: ClaimDetectionRecoveryManager', () => {
  it('should attempt recovery with retry limits', async () => {
    const recoveryManager = new ClaimDetectionRecoveryManager();
    await recoveryManager.recover('Test glitch');
    await recoveryManager.recover('Second glitch');
    await recoveryManager.recover('Third glitch');

    await expect(recoveryManager.recover('Fourth glitch')).rejects.toThrow();
  });
});
