import { describe, it, expect } from 'vitest';
import { ProviderRoutingOptimizer } from '../core/providers/router/ProviderRoutingOptimizer';

describe('Module 6F.8: Controlled Exploration Policy', () => {
  it('should grant bounded exploration bonus to under-observed eligible providers only', () => {
    const optimizer = new ProviderRoutingOptimizer();

    const candidates = [
      { provider: { id: 'ai.new', priority: 10 }, score: { isEligible: true, routingScore: 0.70 } },
      { provider: { id: 'ai.blocked', priority: 10 }, score: { isEligible: false, routingScore: 0.0, ineligibilityReason: 'Cooldown' } }
    ];

    const result = optimizer.optimizeCandidates(candidates, 'AI');

    expect(result[0].decision.explorationBonus).toBeGreaterThan(0.0);
    const blocked = result.find(r => r.provider.id === 'ai.blocked');
    expect(blocked?.decision.explorationBonus).toBe(0.0); // Never explore ineligible providers!
  });
});
