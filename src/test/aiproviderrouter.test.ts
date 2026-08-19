import { describe, it, expect } from 'vitest';
import { AIProviderRegistry } from '../core/providers/registry/AIProviderRegistry';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';
import { AIProviderRouter } from '../core/providers/router/AIProviderRouter';
import { IAIProvider } from '../core/providers/ai/IAIProvider';
import { AIRequest, AIResponse, AIOperationType, AIProviderHealth } from '../core/providers/ai/AIProviderTypes';
import { ProviderCapabilityError } from '../core/error/ProviderErrors';

class TestAIProvider implements IAIProvider {
  public readonly id: string;
  public readonly name: string;
  public readonly type = 'AI' as const;
  public readonly capabilities;
  public readonly priority: number;
  public enabled = true;

  constructor(id: string, priority: number, operations: AIOperationType[]) {
    this.id = id;
    this.name = id;
    this.priority = priority;
    this.capabilities = { providerId: id, operations, maxContextTokens: 4000, supportsStreaming: false, supportsStructuredOutput: true };
  }

  async initialize(): Promise<void> {}
  async analyze(request: AIRequest): Promise<AIResponse> {
    return { requestId: request.requestId, correlationId: request.correlationId, providerId: this.id, operation: request.operation, content: 'OK', latencyMs: 10, createdAt: Date.now() };
  }
  async healthCheck(): Promise<AIProviderHealth> { return { providerId: this.id, status: 'HEALTHY', lastCheckedAt: Date.now() }; }
  destroy(): void {}
}

describe('Module 6B: AIProviderRouter', () => {
  it('should select highest priority capable AI provider deterministically', async () => {
    const registry = new AIProviderRegistry();
    const health = new ProviderHealthManager();

    const lowP = new TestAIProvider('low_p', 10, ['CLAIM_ANALYSIS']);
    const highP = new TestAIProvider('high_p', 100, ['CLAIM_ANALYSIS']);

    await registry.register(lowP);
    await registry.register(highP);

    const router = new AIProviderRouter(registry, health);
    const selected = router.selectProvider({ requestId: 'r1', correlationId: 'c1', operation: 'CLAIM_ANALYSIS', input: 'test', createdAt: Date.now() });

    expect(selected.id).toBe('high_p');
  });

  it('should throw ProviderCapabilityError if no provider supports requested operation', async () => {
    const registry = new AIProviderRegistry();
    const health = new ProviderHealthManager();

    const p1 = new TestAIProvider('p1', 10, ['CLAIM_ANALYSIS']);
    await registry.register(p1);

    const router = new AIProviderRouter(registry, health);
    expect(() => router.selectProvider({ requestId: 'r1', correlationId: 'c1', operation: 'EVIDENCE_SUMMARY', input: 'test', createdAt: Date.now() })).toThrow(ProviderCapabilityError);
  });
});
