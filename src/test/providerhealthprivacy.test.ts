import { describe, it, expect } from 'vitest';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';

describe('Module 6F.7: Health & Reliability Privacy Audit', () => {
  it('should never contain credentials, raw prompts, search queries, or response bodies in metrics or events', () => {
    const manager = new ProviderHealthManager();
    manager.recordSuccess('ai.openai', 100);

    const metrics = manager.getMetrics('ai.openai');
    const jsonStr = JSON.stringify(metrics);

    expect(jsonStr).not.toContain('apiKey');
    expect(jsonStr).not.toContain('authorization');
    expect(jsonStr).not.toContain('prompt');
    expect(jsonStr).not.toContain('query');
  });
});
