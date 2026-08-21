import { describe, it, expect } from 'vitest';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';

describe('Module 6F.7: Provider Health Quota Interaction', () => {
  it('should disqualify quota-exhausted providers regardless of health score', () => {
    const manager = new ProviderHealthManager();
    manager.recordSuccess('search.bing', 50);

    const quotaManager = { isExhausted: (id: string) => id === 'search.bing' };
    const providers = [{ id: 'search.bing', priority: 100 }];

    const ranked = manager.rankProviders(providers, undefined, quotaManager);
    expect(ranked[0].score.isEligible).toBe(false);
    expect(ranked[0].score.isQuotaExhausted).toBe(true);
  });
});
