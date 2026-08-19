import { describe, it, expect } from 'vitest';
import { ProviderExecutionEngine } from '../core/providers/execution/ProviderExecutionEngine';
import { AIProviderRegistry } from '../core/providers/registry/AIProviderRegistry';
import { SearchProviderRegistry } from '../core/providers/registry/SearchProviderRegistry';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';
import { AIProviderRouter } from '../core/providers/router/AIProviderRouter';
import { SearchProviderRouter } from '../core/providers/router/SearchProviderRouter';
import { IAIProvider } from '../core/providers/ai/IAIProvider';
import { AIRequest, AIResponse, AIProviderHealth } from '../core/providers/ai/AIProviderTypes';

class CacheTestAIProvider implements IAIProvider {
  public readonly id = 'ai.cache_test';
  public readonly name = 'Cache Test AI';
  public readonly type = 'AI' as const;
  public readonly capabilities = { providerId: 'ai.cache_test', operations: ['CLAIM_ANALYSIS' as const], maxContextTokens: 4000, supportsStreaming: false, supportsStructuredOutput: true };
  public readonly priority = 10;
  public enabled = true;
  public callCount = 0;

  async initialize(): Promise<void> {}
  async analyze(request: AIRequest): Promise<AIResponse> {
    this.callCount++;
    return { requestId: request.requestId, correlationId: request.correlationId, providerId: this.id, operation: request.operation, content: 'Cached result', latencyMs: 10, createdAt: Date.now() };
  }
  async healthCheck(): Promise<AIProviderHealth> { return { providerId: this.id, status: 'HEALTHY', lastCheckedAt: Date.now() }; }
  destroy(): void {}
}

describe('Module 6E: ProviderExecutionEngine Cache Integration', () => {
  it('should return cached response on subsequent identical requests without invoking provider', async () => {
    const aiRegistry = new AIProviderRegistry();
    const searchRegistry = new SearchProviderRegistry();
    const health = new ProviderHealthManager();
    const aiRouter = new AIProviderRouter(aiRegistry, health);
    const searchRouter = new SearchProviderRouter(searchRegistry, health);

    const provider = new CacheTestAIProvider();
    await aiRegistry.register(provider);

    const engine = new ProviderExecutionEngine(aiRouter, searchRouter, aiRegistry, searchRegistry, health);
    await engine.initialize();

    const req1 = { requestId: 'r1', correlationId: 'c1', operation: 'CLAIM_ANALYSIS' as const, input: 'Repeated claim', createdAt: Date.now() };
    const res1 = await engine.executeAI(req1);

    expect(res1.content).toBe('Cached result');
    expect(provider.callCount).toBe(1);

    const req2 = { requestId: 'r2', correlationId: 'c2', operation: 'CLAIM_ANALYSIS' as const, input: 'Repeated claim', createdAt: Date.now() };
    const res2 = await engine.executeAI(req2);

    expect(res2.content).toBe('Cached result');
    expect(res2.requestId).toBe('r2'); // Preserves caller's requestId
    expect(provider.callCount).toBe(1); // Provider NOT called again
  });
});
