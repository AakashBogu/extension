import { describe, it, expect } from 'vitest';
import { ProviderQuotaManager } from '../core/providers/limits/ProviderQuotaManager';
import { ProviderUsageTracker } from '../core/providers/limits/ProviderUsageTracker';
import { ProviderQuotaPolicy } from '../core/providers/limits/ProviderQuotaPolicy';

describe('Module 6F.6: Quota Reset & Recovery', () => {
  it('should restore remaining quota upon explicit or window reset', () => {
    const usage = new ProviderUsageTracker();
    const quotaManager = new ProviderQuotaManager(usage);

    quotaManager.configureQuotaPolicy('ai.openai', new ProviderQuotaPolicy({ dailyLimits: { requests: 5 } }));

    for (let i = 0; i < 5; i++) {
      usage.recordRequestSuccess({ recordId: `u_${i}`, providerId: 'ai.openai', requestId: `r_${i}`, requestCount: 1, durationMs: 10, timestamp: Date.now() });
    }

    expect(quotaManager.isExhausted('ai.openai')).toBe(true);

    quotaManager.reset('ai.openai');
    expect(quotaManager.isExhausted('ai.openai')).toBe(false);
    expect(quotaManager.getRemaining('ai.openai').requestsRemaining).toBe(5);
  });
});
