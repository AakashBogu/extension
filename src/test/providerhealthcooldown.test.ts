import { describe, it, expect } from 'vitest';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';

describe('Module 6F.7: Provider Health Cooldown Interaction', () => {
  it('should exclude cooled down providers from receiving usable routing scores', () => {
    const manager = new ProviderHealthManager();
    manager.recordSuccess('ai.openai', 50);

    const cooldownManager = { isInCooldown: (id: string) => id === 'ai.openai' };
    const providers = [{ id: 'ai.openai', priority: 100 }];

    const ranked = manager.rankProviders(providers, cooldownManager);
    expect(ranked[0].score.isEligible).toBe(false);
    expect(ranked[0].score.routingScore).toBe(0.0);
  });
});
