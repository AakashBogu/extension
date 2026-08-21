import { describe, it, expect } from 'vitest';
import { AIProviderRouter } from '../core/providers/router/AIProviderRouter';
import { AIProviderRegistry } from '../core/providers/registry/AIProviderRegistry';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';
import { ProviderQuotaManager } from '../core/providers/limits/ProviderQuotaManager';
import { ProviderUsageTracker } from '../core/providers/limits/ProviderUsageTracker';
import { ProviderQuotaPolicy } from '../core/providers/limits/ProviderQuotaPolicy';
import { IAIProvider } from '../core/providers/ai/IAIProvider';
import { AIRequest, AIResponse, AIProviderHealth } from '../core/providers/ai/AIProviderTypes';

class QuotaTestAIProvider implements IAIProvider {
  constructor(public readonly id: string, public readonly priority: number) {}
  public readonly name = 'Quota Test AI';
  public readonly type = 'AI' as const;
  public readonly capabilities = { providerId: 'test', operations: ['CLAIM_ANALYSIS' as const], maxContextTokens: 4000, supportsStreaming: false, supportsStructuredOutput: true };
  public enabled = true;
  async initialize(): Promise<void> {}
  async analyze(req: AIRequest): Promise<AIResponse> { return { requestId: req.requestId, correlationId: req.correlationId, providerId: this.id, operation: req.operation, content: 'OK', latencyMs: 10, createdAt: Date.now() }; }
  async healthCheck(): Promise<AIProviderHealth> { return { providerId: this.id, status: 'HEALTHY', lastCheckedAt: Date.now() }; }
  destroy(): void {}
}

describe('Module 6F.6: Quota-Aware Provider Routing', () => {
  it('should exclude exhausted providers and route to healthy provider with available quota', async () => {
    const registry = new AIProviderRegistry();
    const health = new ProviderHealthManager();
    const usage = new ProviderUsageTracker();
    const quotaManager = new ProviderQuotaManager(usage);

    const p1 = new QuotaTestAIProvider('ai.p1', 10);
    const p2 = new QuotaTestAIProvider('ai.p2', 5);
    await registry.register(p1);
    await registry.register(p2);

    // Exhaust P1
    quotaManager.configureQuotaPolicy('ai.p1', new ProviderQuotaPolicy({ dailyLimits: { requests: 1 } }));
    usage.recordRequestSuccess({ recordId: 'r1', providerId: 'ai.p1', requestId: 'r1', requestCount: 1, durationMs: 10, timestamp: Date.now() });

    quotaManager.configureQuotaPolicy('ai.p2', new ProviderQuotaPolicy({ dailyLimits: { requests: 100 } }));

    const router = new AIProviderRouter(registry, health, undefined, quotaManager);

    const selected = router.selectProvider({ requestId: 'r2', correlationId: 'c1', operation: 'CLAIM_ANALYSIS', input: 'test', createdAt: Date.now() });
    expect(selected.id).toBe('ai.p2'); // P1 excluded because quota exhausted!
  });
});
