import { describe, it, expect } from 'vitest';
import { ProviderExecutionEngine } from '../core/providers/execution/ProviderExecutionEngine';
import { AIProviderRegistry } from '../core/providers/registry/AIProviderRegistry';
import { SearchProviderRegistry } from '../core/providers/registry/SearchProviderRegistry';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';
import { AIProviderRouter } from '../core/providers/router/AIProviderRouter';
import { SearchProviderRouter } from '../core/providers/router/SearchProviderRouter';
import { IAIProvider } from '../core/providers/ai/IAIProvider';
import { AIRequest, AIResponse, AIProviderHealth } from '../core/providers/ai/AIProviderTypes';

class MockAIProvider implements IAIProvider {
  public readonly id = 'ai.mock';
  public readonly name = 'Mock AI';
  public readonly type = 'AI' as const;
  public readonly capabilities = { providerId: 'ai.mock', operations: ['CLAIM_ANALYSIS' as const], maxContextTokens: 4000, supportsStreaming: false, supportsStructuredOutput: true };
  public readonly priority = 10;
  public enabled = true;

  async initialize(): Promise<void> {}
  async analyze(request: AIRequest): Promise<AIResponse> {
    return { requestId: request.requestId, correlationId: request.correlationId, providerId: this.id, operation: request.operation, content: 'Analysis result', latencyMs: 15, createdAt: Date.now() };
  }
  async healthCheck(): Promise<AIProviderHealth> { return { providerId: this.id, status: 'HEALTHY', lastCheckedAt: Date.now() }; }
  destroy(): void {}
}

describe('Module 6D: ProviderExecutionEngine', () => {
  it('should initialize and execute AI request cleanly', async () => {
    const aiRegistry = new AIProviderRegistry();
    const searchRegistry = new SearchProviderRegistry();
    const health = new ProviderHealthManager();
    const aiRouter = new AIProviderRouter(aiRegistry, health);
    const searchRouter = new SearchProviderRouter(searchRegistry, health);

    const provider = new MockAIProvider();
    await aiRegistry.register(provider);

    const engine = new ProviderExecutionEngine(aiRouter, searchRouter, aiRegistry, searchRegistry, health);
    await engine.initialize();

    const response = await engine.executeAI({
      requestId: 'exec_ai_1',
      correlationId: 'corr_1',
      operation: 'CLAIM_ANALYSIS',
      input: 'Fact claim',
      createdAt: Date.now()
    });

    expect(response.providerId).toBe('ai.mock');
    expect(response.content).toBe('Analysis result');
    expect(engine.getMetrics().successfulRequests).toBe(1);
  });
});
