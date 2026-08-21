import { describe, it, expect } from 'vitest';
import { ProviderRoutingWeights } from '../core/providers/router/ProviderRoutingWeights';

describe('Module 6F.8: ProviderRoutingWeights Normalization', () => {
  it('should normalize weights to sum to 1.0 and reject invalid inputs', () => {
    const weights = new ProviderRoutingWeights({
      healthWeight: 35,
      reliabilityWeight: 20,
      latencyWeight: 15,
      quotaWeight: 10,
      rateLimitWeight: 10,
      priorityWeight: 5,
      adaptiveWeight: 5
    });

    const sum = weights.healthWeight + weights.reliabilityWeight + weights.latencyWeight + weights.quotaWeight + weights.rateLimitWeight + weights.priorityWeight + weights.adaptiveWeight;
    expect(sum).toBeCloseTo(1.0, 2);

    expect(() => new ProviderRoutingWeights({ healthWeight: -5 })).toThrow();
    expect(() => new ProviderRoutingWeights({ healthWeight: NaN })).toThrow();
  });
});
