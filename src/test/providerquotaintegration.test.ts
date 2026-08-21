import { describe, it, expect } from 'vitest';
import { ProviderExecutionEngine } from '../core/providers/execution/ProviderExecutionEngine';
import { AIProviderRegistry } from '../core/providers/registry/AIProviderRegistry';
import { SearchProviderRegistry } from '../core/providers/registry/SearchProviderRegistry';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';
import { AIProviderRouter } from '../core/providers/router/AIProviderRouter';
import { SearchProviderRouter } from '../core/providers/router/SearchProviderRouter';
import { ProviderQuotaPolicy } from '../core/providers/limits/ProviderQuotaPolicy';
import { IAIProvider } from '../core/providers/ai/IAIProvider';
import { AIRequest, AIResponse, AIProviderHealth } from '../core/providers/ai/AIProviderTypes';

class ExecutionQuotaTestAIProvider implements IAIProvider {
  public readonly id = 'ai.exec_quota';
  public readonly name = 'Exec Quota AI';
  public readonly type = 'AI' as const;
  public readonly capabilities = { providerId: 'ai.exec_quota', operations: ['CLAIM_ANALYSIS' as const], maxContextTokens: 4000, supportsStreaming: false, supportsStructuredOutput: true };
  public readonly priority = 10;
  public enabled = true;

  async initialize(): Promise<void> {}
  async analyze(req: AIRequest): Promise<AIResponse> { return { requestId: req.requestId, correlationId: req.correlationId, providerId: this.id, operation: req.operation, content: 'Quota Executed', latencyMs: 10, createdAt: Date.now() }; }
  async healthCheck(): Promise<AIProviderHealth> { return { providerId: this.id, status: 'HEALTHY', lastCheckedAt: Date.now() }; }
  destroy(): void {}
}

describe('Module 6F.6: Execution Engine Quota Integration', () => {
  it('should reserve and commit quota cleanly during execution', async () => {
    const aiRegistry = new AIProviderRegistry();
    const searchRegistry = new SearchProviderRegistry();
    const health = new ProviderHealthManager();
    const aiRouter = new AIProviderRouter(aiRegistry, health);
    const searchRouter = new SearchProviderRouter(searchRegistry, health);

    const provider = new ExecutionQuotaTestAIProvider();
    await aiRegistry.register(provider);

    const engine = new ProviderExecutionEngine(aiRouter, searchRouter, aiRegistry, searchRegistry, health);
    await engine.initialize();

    engine.quotaManager.configureQuotaPolicy('ai.exec_quota', new ProviderQuotaPolicy({ dailyLimits: { requests: 10 } }));

    const res = await engine.executeAI({ requestId: 'r_q', correlationId: 'c1', operation: 'CLAIM_ANALYSIS', input: 'test', createdAt: Date.now() });

    expect(res.content).toBe('Quota Executed');
    const remaining = engine.quotaManager.getRemaining('ai.exec_quota');
    expect(remaining.requestsRemaining).toBe(9);
  });
});
