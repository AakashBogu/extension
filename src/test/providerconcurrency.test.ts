import { describe, it, expect } from 'vitest';
import { ProviderExecutionEngine } from '../core/providers/execution/ProviderExecutionEngine';
import { AIProviderRegistry } from '../core/providers/registry/AIProviderRegistry';
import { SearchProviderRegistry } from '../core/providers/registry/SearchProviderRegistry';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';
import { AIProviderRouter } from '../core/providers/router/AIProviderRouter';
import { SearchProviderRouter } from '../core/providers/router/SearchProviderRouter';
import { ProviderConcurrencyError } from '../core/error/ProviderExecutionErrors';

describe('Module 6D: Provider Concurrency Control', () => {
  it('should enforce maxConcurrentRequests limit and throw ProviderConcurrencyError', async () => {
    const aiRegistry = new AIProviderRegistry();
    const searchRegistry = new SearchProviderRegistry();
    const health = new ProviderHealthManager();
    const aiRouter = new AIProviderRouter(aiRegistry, health);
    const searchRouter = new SearchProviderRouter(searchRegistry, health);

    const engine = new ProviderExecutionEngine(aiRouter, searchRouter, aiRegistry, searchRegistry, health, {
      maxConcurrentRequests: 1
    });

    // Manually create an active record in lifecycle manager
    engine.lifecycleManager.createRecord('req_active', 'AI', 30000);
    engine.lifecycleManager.transitionTo('req_active', 'EXECUTING');

    await expect(engine.executeAI({
      requestId: 'req_overflow',
      correlationId: 'c1',
      operation: 'CLAIM_ANALYSIS',
      input: 'test',
      createdAt: Date.now()
    })).rejects.toThrow(ProviderConcurrencyError);
  });
});
