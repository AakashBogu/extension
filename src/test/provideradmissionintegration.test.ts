import { describe, it, expect } from 'vitest';
import { ProviderExecutionEngine } from '../core/providers/execution/ProviderExecutionEngine';
import { AIProviderRegistry } from '../core/providers/registry/AIProviderRegistry';
import { SearchProviderRegistry } from '../core/providers/registry/SearchProviderRegistry';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';
import { AIProviderRouter } from '../core/providers/router/AIProviderRouter';
import { SearchProviderRouter } from '../core/providers/router/SearchProviderRouter';
import { IAIProvider } from '../core/providers/ai/IAIProvider';
import { ProviderAdmissionError } from '../core/error/ProviderLimitErrors';
import { AIRequest, AIResponse, AIProviderHealth } from '../core/providers/ai/AIProviderTypes';

class AdmissionTestAIProvider implements IAIProvider {
  public readonly id = 'ai.adm_test';
  public readonly name = 'Admission Test AI';
  public readonly type = 'AI' as const;
  public readonly capabilities = { providerId: 'ai.adm_test', operations: ['CLAIM_ANALYSIS' as const], maxContextTokens: 4000, supportsStreaming: false, supportsStructuredOutput: true };
  public readonly priority = 10;
  public enabled = true;
  public callCount = 0;

  async initialize(): Promise<void> {}
  async analyze(request: AIRequest): Promise<AIResponse> {
    this.callCount++;
    return { requestId: request.requestId, correlationId: request.correlationId, providerId: this.id, operation: request.operation, content: 'Admitted result', latencyMs: 10, createdAt: Date.now() };
  }
  async healthCheck(): Promise<AIProviderHealth> { return { providerId: this.id, status: 'HEALTHY', lastCheckedAt: Date.now() }; }
  destroy(): void {}
}

describe('Module 6F.4: ProviderExecutionEngine Admission Integration', () => {
  it('should block execution, retries, and fallbacks when admission is denied', async () => {
    const aiRegistry = new AIProviderRegistry();
    const searchRegistry = new SearchProviderRegistry();
    const health = new ProviderHealthManager();
    const aiRouter = new AIProviderRouter(aiRegistry, health);
    const searchRouter = new SearchProviderRouter(searchRegistry, health);

    const provider = new AdmissionTestAIProvider();
    await aiRegistry.register(provider);

    const engine = new ProviderExecutionEngine(aiRouter, searchRouter, aiRegistry, searchRegistry, health);
    await engine.initialize();

    // Disable provider in admission controller
    engine.admissionController.setProviderEnabled('ai.adm_test', false);

    const req = { requestId: 'r_denied', correlationId: 'c1', operation: 'CLAIM_ANALYSIS' as const, input: 'Blocked claim', createdAt: Date.now() };

    await expect(engine.executeAI(req)).rejects.toThrow(ProviderAdmissionError);
    expect(provider.callCount).toBe(0); // Provider call NEVER executed!
  });
});
