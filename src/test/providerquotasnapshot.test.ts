import { describe, it, expect } from 'vitest';
import { ProviderQuotaSnapshotBuilder } from '../core/providers/limits/ProviderQuotaSnapshotBuilder';
import { ExtendedQuotaConsumption } from '../core/providers/limits/ProviderQuotaState';

describe('Module 6F.6: ProviderQuotaSnapshotBuilder', () => {
  it('should build snapshots and identify limiting quota dimensions', () => {
    const consumptions: ExtendedQuotaConsumption[] = [
      {
        allocation: { scope: 'PROVIDER', dimension: 'REQUESTS', allocatedLimit: 100, period: 'DAILY' },
        consumedAmount: 50,
        remainingAmount: 50,
        resetTimestamp: Date.now() + 1000,
        isExhausted: false,
        utilizationRatio: 0.5,
        level: 'NORMAL',
        isLimiting: false,
        windowStart: Date.now(),
        windowEnd: Date.now() + 1000
      },
      {
        allocation: { scope: 'PROVIDER', dimension: 'TOKENS', allocatedLimit: 1000, period: 'DAILY' },
        consumedAmount: 900,
        remainingAmount: 100,
        resetTimestamp: Date.now() + 1000,
        isExhausted: false,
        utilizationRatio: 0.9,
        level: 'CRITICAL',
        isLimiting: false,
        windowStart: Date.now(),
        windowEnd: Date.now() + 1000
      }
    ];

    const snapshot = ProviderQuotaSnapshotBuilder.buildSnapshot('ai.gemini', consumptions);
    expect(snapshot.providerId).toBe('ai.gemini');
    expect((snapshot.quotas[1] as ExtendedQuotaConsumption).isLimiting).toBe(true);
  });
});
