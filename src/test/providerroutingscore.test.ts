import { describe, it, expect } from 'vitest';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';

describe('Module 6F.7: ProviderRoutingScore', () => {
  it('should produce deterministic routing scores and deny ineligible providers', () => {
    const manager = new ProviderHealthManager();
    manager.recordSuccess('ai.openai', 200);

    const normalScore = manager.getRoutingScore('ai.openai', 10, false, false, false, true);
    expect(normalScore.isEligible).toBe(true);
    expect(normalScore.routingScore).toBeGreaterThan(0);

    const cooldownScore = manager.getRoutingScore('ai.openai', 10, true, false, false, true);
    expect(cooldownScore.isEligible).toBe(false);
    expect(cooldownScore.routingScore).toBe(0.0);
  });
});
