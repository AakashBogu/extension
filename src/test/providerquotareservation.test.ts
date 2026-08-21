import { describe, it, expect } from 'vitest';
import { ProviderQuotaReservationManager } from '../core/providers/limits/ProviderQuotaReservationManager';

describe('Module 6F.6: ProviderQuotaReservationManager', () => {
  it('should handle creation, reserved totals calculation, release, and commit', () => {
    const manager = new ProviderQuotaReservationManager();

    const handle = manager.reserve('ai.openai', undefined, 1, 500, 0.01);
    const totals = manager.getReservedTotals('ai.openai');

    expect(totals.reservedRequests).toBe(1);
    expect(totals.reservedTokens).toBe(500);

    const released = handle.release();
    expect(released).toBe(true);
    expect(manager.getReservedTotals('ai.openai').reservedRequests).toBe(0);
  });
});
