import { describe, it, expect } from 'vitest';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';

describe('Module 6F.7: Provider Health Ranking & Tie Breaking', () => {
  it('should rank providers deterministically by eligibility, routing score, priority, and lexical ID tie-breaker', () => {
    const manager = new ProviderHealthManager();
    manager.recordSuccess('ai.a', 100);
    manager.recordSuccess('ai.b', 100);

    const providers = [
      { id: 'ai.b', priority: 10 },
      { id: 'ai.a', priority: 10 }
    ];

    const ranked = manager.rankProviders(providers);
    expect(ranked[0].provider.id).toBe('ai.a'); // Lexical tie-breaker!
  });
});
