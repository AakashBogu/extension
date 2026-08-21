import { describe, it, expect } from 'vitest';
import { ProviderExecutionEngine } from '../core/providers/execution/ProviderExecutionEngine';
import { AIProviderRouter } from '../core/providers/router/AIProviderRouter';
import { SearchProviderRouter } from '../core/providers/router/SearchProviderRouter';
import { AIProviderRegistry } from '../core/providers/registry/AIProviderRegistry';
import { SearchProviderRegistry } from '../core/providers/registry/SearchProviderRegistry';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';
import { ProviderReliabilityRecoveryManager } from '../core/providers/recovery/ProviderReliabilityRecoveryManager';

describe('Module 6F.9: End-to-End Circuit Breaker Execution Integration', () => {
  it('should initialize engine with circuit recovery manager cleanly', async () => {
    const aiRegistry = new AIProviderRegistry();
    const searchRegistry = new SearchProviderRegistry();
    const health = new ProviderHealthManager();
    const recovery = new ProviderReliabilityRecoveryManager();

    const aiRouter = new AIProviderRouter(aiRegistry, health, undefined, undefined, undefined, undefined, undefined, recovery);
    const searchRouter = new SearchProviderRouter(searchRegistry, health, undefined, undefined, undefined, undefined, undefined, recovery);

    const engine = new ProviderExecutionEngine(
      aiRouter,
      searchRouter,
      aiRegistry,
      searchRegistry,
      health,
      undefined, undefined, undefined, undefined, undefined, undefined, undefined,
      recovery
    );

    await engine.initialize();
    expect(engine.getStatus()).toBe('READY');
    await engine.shutdown();
  });
});
