import { describe, it, expect } from 'vitest';
import { ProviderRoutingOptimizer } from '../core/providers/router/ProviderRoutingOptimizer';

describe('Module 6F.8: ProviderRoutingDecision Schema & Bounds', () => {
  it('should produce normalized finalScore clamped between 0.0 and 1.0', () => {
    const optimizer = new ProviderRoutingOptimizer();
    const candidates = [
      { provider: { id: 'search.bing', priority: 50 }, score: { isEligible: true, routingScore: 0.95 } }
    ];

    const result = optimizer.optimizeCandidates(candidates, 'SEARCH');
    expect(result[0].decision.finalScore).toBeGreaterThanOrEqual(0.0);
    expect(result[0].decision.finalScore).toBeLessThanOrEqual(1.0);
    expect(result[0].decision.requestType).toBe('SEARCH');
  });
});
