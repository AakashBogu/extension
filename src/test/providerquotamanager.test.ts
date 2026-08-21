import { describe, it, expect } from 'vitest';
import { ProviderQuotaManager } from '../core/providers/limits/ProviderQuotaManager';
import { ProviderUsageTracker } from '../core/providers/limits/ProviderUsageTracker';
import { ProviderQuotaPolicy } from '../core/providers/limits/ProviderQuotaPolicy';

describe('Module 6F.6: ProviderQuotaManager Lifecycle', () => {
  it('should initialize, configure quota policies, and report remaining quotas', async () => {
    const usage = new ProviderUsageTracker();
    const quotaManager = new ProviderQuotaManager(usage);
    await quotaManager.initialize();

    quotaManager.configureQuotaPolicy('ai.openai', new ProviderQuotaPolicy({
      dailyLimits: { requests: 100, tokens: 50000 }
    }));

    const remaining = quotaManager.getRemaining('ai.openai');
    expect(remaining.requestsRemaining).toBe(100);
    expect(remaining.tokensRemaining).toBe(50000);
    expect(quotaManager.isExhausted('ai.openai')).toBe(false);
  });
});
