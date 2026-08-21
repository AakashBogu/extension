import { describe, it, expect } from 'vitest';
import { ProviderAdaptiveRoutingPolicy } from '../core/providers/router/ProviderAdaptiveRoutingPolicy';

describe('Module 6F.8: ProviderAdaptiveRoutingPolicy Configuration', () => {
  it('should initialize with default parameters and validate input bounds', () => {
    const policy = new ProviderAdaptiveRoutingPolicy({ requestType: 'AI' });
    expect(policy.emaAlpha).toBe(0.15);
    expect(policy.explorationBonusMax).toBe(0.05);
    expect(policy.minimumScoreDelta).toBe(0.03);
    expect(policy.stickinessBonus).toBe(0.02);

    expect(() => new ProviderAdaptiveRoutingPolicy({ emaAlpha: -1 })).toThrow();
    expect(() => new ProviderAdaptiveRoutingPolicy({ explorationBonusMax: 0.50 })).toThrow();
  });
});
