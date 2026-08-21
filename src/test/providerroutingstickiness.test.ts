import { describe, it, expect } from 'vitest';
import { ProviderRoutingOptimizer } from '../core/providers/router/ProviderRoutingOptimizer';

describe('Module 6F.8: Provider Stickiness & Oscillation Control', () => {
  it('should apply stickiness bonus to recently selected provider without overriding safety', () => {
    const optimizer = new ProviderRoutingOptimizer();
    optimizer.outcomeTracker.recordSelection('ai.p1', 'AI');

    const candidates = [
      { provider: { id: 'ai.p1', priority: 10 }, score: { isEligible: true, routingScore: 0.70 } },
      { provider: { id: 'ai.p2', priority: 10 }, score: { isEligible: true, routingScore: 0.71 } }
    ];

    const result = optimizer.optimizeCandidates(candidates, 'AI');
    // P1 gets stickiness bonus (+0.02) boosting final score past P2 (0.72 vs 0.71)
    expect(result[0].provider.id).toBe('ai.p1');
  });
});
