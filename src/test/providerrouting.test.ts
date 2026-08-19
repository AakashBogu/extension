import { describe, it, expect } from 'vitest';
import { AIProviderRegistry } from '../core/providers/registry/AIProviderRegistry';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';
import { AIProviderRouter } from '../core/providers/router/AIProviderRouter';
import { IAIProvider } from '../core/providers/ai/IAIProvider';
import { AIRequest, AIResponse, AIProviderHealth } from '../core/providers/ai/AIProviderTypes';

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
    if (this.shouldFail) throw new Error(`Provider [${this.id}] failed`);
    return { requestId: request.requestId, correlationId: request.correlationId, providerId: this.id, operation: request.operation, content: 'Success', latencyMs: 10, createdAt: Date.now() };
  }
  async healthCheck(): Promise<AIProviderHealth> { return { providerId: this.id, status: 'HEALTHY', lastCheckedAt: Date.now() }; }
  destroy(): void {}
}

describe('Module 6B: End-to-End Provider Routing & Fallback', () => {
  it('should fall back to next priority provider if primary provider fails during execution', async () => {
    const registry = new AIProviderRegistry();
    const health = new ProviderHealthManager();

    const primaryFlaky = new FlakyAIProvider('primary_flaky', 100, true);
    const backupHealthy = new FlakyAIProvider('backup_healthy', 50, false);

    await registry.register(primaryFlaky);
    await registry.register(backupHealthy);

    const router = new AIProviderRouter(registry, health);
    const response = await router.executeWithFallback({
      requestId: 'req_fallback_1',
      correlationId: 'corr_fallback_1',
      operation: 'CLAIM_ANALYSIS',
      input: 'test claim',
      createdAt: Date.now()
    });

    expect(response.providerId).toBe('backup_healthy');
    expect(response.content).toBe('Success');
    expect(health.getHealth('primary_flaky')).toBe('DEGRADED');
  });
});
