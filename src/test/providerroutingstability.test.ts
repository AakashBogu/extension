import { describe, it, expect } from 'vitest';
import { ProviderRoutingOptimizer } from '../core/providers/router/ProviderRoutingOptimizer';
import { ProviderAdaptiveRoutingPolicy } from '../core/providers/router/ProviderAdaptiveRoutingPolicy';

describe('Module 6F.8: Routing Stability & Hysteresis Delta', () => {
  it('should enforce minimumScoreDelta threshold before switching providers', () => {
    const optimizer = new ProviderRoutingOptimizer();
    const policy = new ProviderAdaptiveRoutingPolicy({ minimumScoreDelta: 0.05 });

    const candidates = [
      { provider: { id: 'ai.p1', priority: 10 }, score: { isEligible: true, routingScore: 0.80 } },
      { provider: { id: 'ai.p2', priority: 10 }, score: { isEligible: true, routingScore: 0.82 } }
    ];

    const result = optimizer.optimizeCandidates(candidates, 'AI', policy);
    // Difference (0.02) is less than minimumScoreDelta (0.05), so tie-breaker falls back to priority and lexical order!
    expect(result[0].provider.id).toBe('ai.p1'); // Lexical tie-breaker keeps P1 top!
  });
});
