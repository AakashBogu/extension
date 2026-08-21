import { describe, it, expect } from 'vitest';
import { ProviderRoutingOptimizer } from '../core/providers/router/ProviderRoutingOptimizer';
import { ProviderRoutingOutcomeTracker } from '../core/providers/router/ProviderRoutingOutcomeTracker';
import { ProviderRoutingScore } from '../core/providers/health/ProviderHealthTypes';

describe('Module 6F.8: Fail-Safe Fallback Behavior', () => {
  it('should fall back to baseline 6F.7 routing when adaptive optimization encounters internal error', () => {
    const optimizer = new ProviderRoutingOptimizer();
    // Simulate internal throwing error during evaluation
    optimizer.outcomeTracker = {
      getAdaptiveAdjustment: () => { throw new Error('Simulated internal optimizer failure'); },
      getLastSelected: () => undefined
    } as unknown as ProviderRoutingOutcomeTracker;

    const dummyScore: ProviderRoutingScore = {
      providerId: 'ai.openai',
      routingScore: 0.85,
      healthScore: 0.85,
      priority: 10,
      isEligible: true,
      inCooldown: false,
      isQuotaExhausted: false,
      isRateLimited: false,
      calculatedAt: Date.now()
    };

    const candidates = [
      { provider: { id: 'ai.openai', priority: 10 }, score: dummyScore }
    ];

    const result = optimizer.optimizeCandidates(candidates, 'AI');
    expect(result.length).toBe(1);
    expect(result[0].decision.decisionReason).toContain('Fail-safe fallback');
  });
});
