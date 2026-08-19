import { describe, it, expect } from 'vitest';
import { AIProviderRegistry } from '../core/providers/registry/AIProviderRegistry';
import { IAIProvider } from '../core/providers/ai/IAIProvider';
import { AIRequest, AIResponse, AIProviderHealth } from '../core/providers/ai/AIProviderTypes';
import { ProviderConfigurationError } from '../core/error/ProviderErrors';

class FakeAIProvider implements IAIProvider {
  public readonly id: string;
  public readonly name: string;
  public readonly type = 'AI' as const;
  public readonly capabilities = { providerId: '', operations: ['CLAIM_ANALYSIS' as const], maxContextTokens: 4000, supportsStreaming: false, supportsStructuredOutput: true };
  public readonly priority = 10;
  public enabled = true;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.capabilities.providerId = id;
  }

  async initialize(): Promise<void> {}
  async analyze(_request: AIRequest): Promise<AIResponse> {
    return { requestId: _request.requestId, correlationId: _request.correlationId, providerId: this.id, operation: _request.operation, content: 'OK', latencyMs: 10, createdAt: Date.now() };
  }
  async healthCheck(): Promise<AIProviderHealth> { return { providerId: this.id, status: 'HEALTHY', lastCheckedAt: Date.now() }; }
  destroy(): void {}
}

describe('Module 6B: AIProviderRegistry', () => {
  it('should register, lookup, list, and unregister AI providers', async () => {
    const registry = new AIProviderRegistry();
    const provider = new FakeAIProvider('ai_1', 'Fake AI Provider');

    await registry.register(provider);
    expect(registry.has('ai_1')).toBe(true);
    expect(registry.get('ai_1')).toBe(provider);
    expect(registry.getEnabled().length).toBe(1);

    await registry.unregister('ai_1');
    expect(registry.has('ai_1')).toBe(false);
  });

  it('should reject duplicate provider registration deterministically', async () => {
    const registry = new AIProviderRegistry();
    const provider = new FakeAIProvider('ai_dup', 'Duplicate AI');

    await registry.register(provider);
    await expect(registry.register(provider)).rejects.toThrow(ProviderConfigurationError);
  });
});
