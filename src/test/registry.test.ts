import { describe, it, expect, beforeEach } from 'vitest';
import { AIProviderRegistry } from '../providers/registry/AIProviderRegistry';
import { SearchProviderRegistry } from '../providers/registry/SearchProviderRegistry';
import { InvalidProviderError } from '../core/error/DIPluginErrors';

describe('Module 1B: Provider Registries', () => {
  let aiRegistry: AIProviderRegistry;
  let searchRegistry: SearchProviderRegistry;

  beforeEach(() => {
    aiRegistry = new AIProviderRegistry();
    searchRegistry = new SearchProviderRegistry();
  });

  it('should register, resolve, and set default AI providers', () => {
    const gemini = { id: 'gemini', name: 'Google Gemini Flash' };
    const openai = { id: 'openai', name: 'OpenAI GPT-4o' };

    aiRegistry.register('gemini', gemini, 10);
    aiRegistry.register('openai', openai, 5);

    expect(aiRegistry.resolve('gemini')).toBe(gemini);
    expect(aiRegistry.getDefault()).toBe(gemini);

    aiRegistry.setDefault('openai');
    expect(aiRegistry.getDefault()).toBe(openai);
  });

  it('should return providers sorted by priority ordering', () => {
    searchRegistry.register('ddg', { id: 'ddg', name: 'DuckDuckGo' }, 1);
    searchRegistry.register('tavily', { id: 'tavily', name: 'Tavily Search' }, 100);

    const sorted = searchRegistry.listProviders();
    expect(sorted[0].id).toBe('tavily');
    expect(sorted[1].id).toBe('ddg');
  });

  it('should throw InvalidProviderError on resolving missing provider', () => {
    expect(() => aiRegistry.resolve('missing_provider')).toThrow(InvalidProviderError);
  });
});
