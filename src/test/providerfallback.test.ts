import { describe, it, expect } from 'vitest';
import { ProviderExecutionEngine } from '../core/providers/execution/ProviderExecutionEngine';
import { AIProviderRegistry } from '../core/providers/registry/AIProviderRegistry';
import { SearchProviderRegistry } from '../core/providers/registry/SearchProviderRegistry';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';
import { AIProviderRouter } from '../core/providers/router/AIProviderRouter';
import { SearchProviderRouter } from '../core/providers/router/SearchProviderRouter';
import { IAIProvider } from '../core/providers/ai/IAIProvider';
import { AIRequest, AIResponse, AIProviderHealth } from '../core/providers/ai/AIProviderTypes';
import { ProviderRequestError } from '../core/error/ProviderErrors';

class FlakyAIProvider implements IAIProvider {
  public readonly id: string;
  public readonly name: string;
  public readonly type = 'AI' as const;
  public readonly capabilities = { providerId: '', operations: ['CLAIM_ANALYSIS' as const], maxContextTokens: 4000, supportsStreaming: false, supportsStructuredOutput: true };
  public readonly priority: number;
  public enabled = true;
  public shouldFail: boolean;

  constructor(id: string, priority: number, shouldFail: boolean = false) {
    this.id = id;
    this.name = id;
    this.priority = priority;
    this.shouldFail = shouldFail;
    this.capabilities.providerId = id;
  }

  async initialize(): Promise<void> {}
  async analyze(request: AIRequest): Promise<AIResponse> {
    if (this.shouldFail) throw new ProviderRequestError('Provider failed', { providerId: this.id, retryable: false });
    return { requestId: request.requestId, correlationId: request.correlationId, providerId: this.id, operation: request.operation, content: 'Success', latencyMs: 10, createdAt: Date.now() };
  }
  async healthCheck(): Promise<AIProviderHealth> { return { providerId: this.id, status: 'HEALTHY', lastCheckedAt: Date.now() }; }
  destroy(): void {}
}

describe('Module 6D: Provider Fallback Execution', () => {
  it('should fall back to next provider when primary provider fails', async () => {
    const aiRegistry = new AIProviderRegistry();
    const searchRegistry = new SearchProviderRegistry();
    const health = new ProviderHealthManager();
    const aiRouter = new AIProviderRouter(aiRegistry, health);
    const searchRouter = new SearchProviderRouter(searchRegistry, health);

    const primary = new FlakyAIProvider('primary', 100, true);
    const backup = new FlakyAIProvider('backup', 50, false);

    await aiRegistry.register(primary);
    await aiRegistry.register(backup);

    const engine = new ProviderExecutionEngine(aiRouter, searchRouter, aiRegistry, searchRegistry, health);
    const response = await engine.executeAI({
      requestId: 'fallback_req_1',
      correlationId: 'c1',
      operation: 'CLAIM_ANALYSIS',
      input: 'test',
      createdAt: Date.now()
    });

    expect(response.providerId).toBe('backup');
    expect(response.content).toBe('Success');
    expect(engine.getMetrics().fallbackAttempts).toBe(1);
  });
});
