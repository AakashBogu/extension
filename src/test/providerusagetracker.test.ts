import { describe, it, expect } from 'vitest';
import { ProviderUsageTracker } from '../core/providers/limits/ProviderUsageTracker';
import { ProviderExecutionEngine } from '../core/providers/execution/ProviderExecutionEngine';
import { AIProviderRegistry } from '../core/providers/registry/AIProviderRegistry';
import { SearchProviderRegistry } from '../core/providers/registry/SearchProviderRegistry';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';
import { AIProviderRouter } from '../core/providers/router/AIProviderRouter';
import { SearchProviderRouter } from '../core/providers/router/SearchProviderRouter';
import { IAIProvider } from '../core/providers/ai/IAIProvider';
import { AIRequest, AIResponse, AIProviderHealth } from '../core/providers/ai/AIProviderTypes';

class TrackerTestAIProvider implements IAIProvider {
  public readonly id = 'ai.tracker_test';
  public readonly name = 'Tracker Test AI';
  public readonly type = 'AI' as const;
  public readonly capabilities = { providerId: 'ai.tracker_test', operations: ['CLAIM_ANALYSIS' as const], maxContextTokens: 4000, supportsStreaming: false, supportsStructuredOutput: true };
  public readonly priority = 10;
  public enabled = true;

  async initialize(): Promise<void> {}
  async analyze(request: AIRequest): Promise<AIResponse> {
    return {
      requestId: request.requestId,
      correlationId: request.correlationId,
      providerId: this.id,
      operation: request.operation,
      content: 'Usage tracked result',
      modelName: 'gpt-4o',
      tokenUsage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      latencyMs: 25,
      createdAt: Date.now()
    };
  }
  async healthCheck(): Promise<AIProviderHealth> { return { providerId: this.id, status: 'HEALTHY', lastCheckedAt: Date.now() }; }
  destroy(): void {}
}

describe('Module 6F.2: ProviderUsageTracker', () => {
  it('should track provider and model request counts, token usage, and latency', () => {
    const tracker = new ProviderUsageTracker();

    tracker.recordRequestStart('ai.openai', 'req_1', 'gpt-4o');
    tracker.recordRequestSuccess({
      recordId: 'rec_1',
      providerId: 'ai.openai',
      requestId: 'req_1',
      requestCount: 1,
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      estimatedCost: 0.005,
      durationMs: 200,
      timestamp: Date.now()
    }, 'gpt-4o');

    const providerSnapshot = tracker.getSnapshot('ai.openai');
    expect(providerSnapshot).not.toBeNull();
    expect(providerSnapshot?.metrics.totalRequests).toBe(1);
    expect(providerSnapshot?.metrics.successfulRequests).toBe(1);
    expect(providerSnapshot?.metrics.totalTokens).toBe(150);
    expect(providerSnapshot?.metrics.inputTokens).toBe(100);
    expect(providerSnapshot?.metrics.outputTokens).toBe(50);
    expect(providerSnapshot?.metrics.estimatedCost).toBe(0.005);
    expect(providerSnapshot?.metrics.currentConcurrentRequests).toBe(0);
    expect(providerSnapshot?.metrics.peakConcurrentRequests).toBe(1);

    const modelSnapshot = tracker.getSnapshot('ai.openai', 'gpt-4o');
    expect(modelSnapshot).not.toBeNull();
    expect(modelSnapshot?.modelId).toBe('gpt-4o');
    expect(modelSnapshot?.metrics.totalTokens).toBe(150);
  });

  it('should manage time buckets and window snapshots', () => {
    const tracker = new ProviderUsageTracker();

    tracker.recordRequestSuccess({
      recordId: 'rec_2',
      providerId: 'search.brave',
      requestId: 'req_2',
      requestCount: 1,
      durationMs: 120,
      timestamp: Date.now()
    });

    const bucketSnapshot = tracker.getBucketSnapshot('search.brave', 'MINUTE');
    expect(bucketSnapshot).not.toBeNull();
    expect(bucketSnapshot?.window).toBe('MINUTE');
    expect(bucketSnapshot?.metrics.successfulRequests).toBe(1);
  });

  it('should integrate seamlessly with ProviderExecutionEngine', async () => {
    const aiRegistry = new AIProviderRegistry();
    const searchRegistry = new SearchProviderRegistry();
    const health = new ProviderHealthManager();
    const aiRouter = new AIProviderRouter(aiRegistry, health);
    const searchRouter = new SearchProviderRouter(searchRegistry, health);

    const provider = new TrackerTestAIProvider();
    await aiRegistry.register(provider);

    const engine = new ProviderExecutionEngine(aiRouter, searchRouter, aiRegistry, searchRegistry, health);
    await engine.initialize();

    const response = await engine.executeAI({
      requestId: 'exec_usage_1',
      correlationId: 'c1',
      operation: 'CLAIM_ANALYSIS',
      input: 'Fact check statement',
      createdAt: Date.now()
    });

    expect(response.content).toBe('Usage tracked result');

    const usageSnapshot = engine.usageTracker.getSnapshot('ai.tracker_test');
    expect(usageSnapshot).not.toBeNull();
    expect(usageSnapshot?.metrics.successfulRequests).toBe(1);
    expect(usageSnapshot?.metrics.totalTokens).toBe(150);

    const modelUsage = engine.usageTracker.getSnapshot('ai.tracker_test', 'gpt-4o');
    expect(modelUsage).not.toBeNull();
    expect(modelUsage?.metrics.totalTokens).toBe(150);
  });

  it('should handle reset operations cleanly', () => {
    const tracker = new ProviderUsageTracker();

    tracker.recordRequestStart('ai.gemini', 'req_reset');
    tracker.recordRequestSuccess({
      recordId: 'rec_3',
      providerId: 'ai.gemini',
      requestId: 'req_reset',
      requestCount: 1,
      durationMs: 50,
      timestamp: Date.now()
    });

    tracker.resetProvider('ai.gemini');
    const snapshotAfterReset = tracker.getSnapshot('ai.gemini');
    expect(snapshotAfterReset?.metrics.totalRequests).toBe(0);

    tracker.recordRequestStart('search.bing', 'req_all');
    tracker.resetAll();
    const bingSnapshot = tracker.getSnapshot('search.bing');
    expect(bingSnapshot?.metrics.totalRequests).toBe(0);
  });
});
