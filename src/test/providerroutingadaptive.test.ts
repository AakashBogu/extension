import { describe, it, expect } from 'vitest';
import { ProviderRoutingOptimizer } from '../core/providers/router/ProviderRoutingOptimizer';

describe('Module 6F.8: Adaptive Learning Loop', () => {
  it('should gradually improve score of successful providers over time', () => {
    const optimizer = new ProviderRoutingOptimizer();

    for (let i = 0; i < 15; i++) {
      optimizer.outcomeTracker.recordOutcome('ai.openai', 'AI', true, 150);
    }

    const candidates = [
      { provider: { id: 'ai.openai', priority: 10 }, score: { isEligible: true, routingScore: 0.80 } }
    ];

    const result = optimizer.optimizeCandidates(candidates, 'AI');
    expect(result[0].decision.adaptiveAdjustment).toBeGreaterThan(0);
  });
});
