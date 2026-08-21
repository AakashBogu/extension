import { describe, it, expect } from 'vitest';
import { ProviderRoutingOptimizer } from '../core/providers/router/ProviderRoutingOptimizer';

describe('Module 6F.8: Privacy & Data Security Audit', () => {
  it('should never contain credentials, raw prompts, queries, or payloads in decision records', () => {
    const optimizer = new ProviderRoutingOptimizer();
    const candidates = [
      { provider: { id: 'ai.openai', priority: 10 }, score: { isEligible: true, routingScore: 0.80 } }
    ];

    const result = optimizer.optimizeCandidates(candidates, 'AI');
    const jsonStr = JSON.stringify(result[0].decision);

    expect(jsonStr).not.toContain('apiKey');
    expect(jsonStr).not.toContain('authorization');
    expect(jsonStr).not.toContain('prompt');
    expect(jsonStr).not.toContain('query');
  });
});
