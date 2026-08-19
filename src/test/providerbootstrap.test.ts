import { describe, it, expect } from 'vitest';
import { ProviderBootstrap } from '../core/providers/bootstrap/ProviderBootstrap';
import { AIProviderRegistry } from '../core/providers/registry/AIProviderRegistry';
import { SearchProviderRegistry } from '../core/providers/registry/SearchProviderRegistry';

describe('Module 6C: ProviderBootstrap', () => {
  it('should bootstrap enabled providers and register them into registries', async () => {
    const aiRegistry = new AIProviderRegistry();
    const searchRegistry = new SearchProviderRegistry();

    await ProviderBootstrap.bootstrap({
      openai: { enabled: true, endpoint: 'https://api.openai.com/v1', model: 'gpt-4o', timeoutMs: 5000, priority: 10 },
      brave: { enabled: true, endpoint: 'https://api.search.brave.com/res/v1/web/search', maxResults: 5, timeoutMs: 5000, priority: 10 }
    }, aiRegistry, searchRegistry);

    expect(aiRegistry.has('ai.openai')).toBe(true);
    expect(searchRegistry.has('search.brave')).toBe(true);
    expect(aiRegistry.has('ai.gemini')).toBe(false);
  });
});
