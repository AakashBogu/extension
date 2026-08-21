import { describe, it, expect } from 'vitest';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';

describe('Module 6F.7: ProviderHealthScoring', () => {
  it('should calculate normalized health score between 0.0 and 1.0', () => {
    const manager = new ProviderHealthManager();

    manager.recordSuccess('ai.openai', 100);
    const score1 = manager.getHealthScore('ai.openai');

    expect(score1.healthScore).toBeGreaterThanOrEqual(0.0);
    expect(score1.healthScore).toBeLessThanOrEqual(1.0);
    expect(score1.healthState).toBe('HEALTHY');

    manager.recordFailure('ai.openai', 'Error');
    const score2 = manager.getHealthScore('ai.openai');
    expect(score2.healthScore).toBeLessThan(score1.healthScore);
  });
});
