import { describe, it, expect } from 'vitest';
import { ProviderRoutingOptimizer } from '../core/providers/router/ProviderRoutingOptimizer';

describe('Module 6F.8: ProviderRoutingOptimizer Basic Candidate Ranking', () => {
  it('should optimize candidate candidates and attach routing decisions', () => {
    const optimizer = new ProviderRoutingOptimizer();
    const candidates = [
      { provider: { id: 'ai.p1', priority: 10 }, score: { isEligible: true, routingScore: 0.8 } },
      { provider: { id: 'ai.p2', priority: 5 }, score: { isEligible: true, routingScore: 0.7 } }
    ];

    const optimized = optimizer.optimizeCandidates(candidates, 'AI');
    expect(optimized.length).toBe(2);
    expect(optimized[0].provider.id).toBe('ai.p1');
    expect(optimized[0].decision.finalScore).toBeGreaterThan(0.7);
  });
});
