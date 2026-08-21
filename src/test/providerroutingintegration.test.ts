import { describe, it, expect } from 'vitest';
import { AIProviderRouter } from '../core/providers/router/AIProviderRouter';
import { AIProviderRegistry } from '../core/providers/registry/AIProviderRegistry';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';
import { IAIProvider } from '../core/providers/ai/IAIProvider';
import { AIRequest, AIResponse, AIProviderHealth } from '../core/providers/ai/AIProviderTypes';

class AdaptiveAIProvider implements IAIProvider {
  constructor(public readonly id: string, public readonly priority: number) {}
  public readonly name = 'Adaptive AI';
  public readonly type = 'AI' as const;
  public readonly capabilities = { providerId: 'test', operations: ['CLAIM_ANALYSIS' as const], maxContextTokens: 4000, supportsStreaming: false, supportsStructuredOutput: true };
  public enabled = true;

  async initialize(): Promise<void> {}
  async analyze(req: AIRequest): Promise<AIResponse> { return { requestId: req.requestId, correlationId: req.correlationId, providerId: this.id, operation: req.operation, content: 'OK', latencyMs: 10, createdAt: Date.now() }; }
  async healthCheck(): Promise<AIProviderHealth> { return { providerId: this.id, status: 'HEALTHY', lastCheckedAt: Date.now() }; }
  destroy(): void {}
}

describe('Module 6F.8: AIProviderRouter Integration with Adaptive Optimizer', () => {
  it('should select provider using adaptive routing optimization', async () => {
    const registry = new AIProviderRegistry();
    const health = new ProviderHealthManager();

    const p1 = new AdaptiveAIProvider('ai.p1', 10);
    const p2 = new AdaptiveAIProvider('ai.p2', 5);
    await registry.register(p1);
    await registry.register(p2);

    const router = new AIProviderRouter(registry, health);

    const selected = router.selectProvider({ requestId: 'r1', correlationId: 'c1', operation: 'CLAIM_ANALYSIS', input: 'test', createdAt: Date.now() });
    expect(selected.id).toBe('ai.p1');
  });
});
