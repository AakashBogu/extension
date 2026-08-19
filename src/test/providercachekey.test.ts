import { describe, it, expect } from 'vitest';
import { ProviderCacheKeyGenerator } from '../core/providers/cache/ProviderCacheKeyGenerator';
import { ProviderCacheKeyError } from '../core/error/ProviderCacheErrors';
import { AIRequest } from '../core/providers/ai/AIProviderTypes';

describe('Module 6E: ProviderCacheKeyGenerator', () => {
  it('should generate deterministic keys for AI and Search requests with whitespace normalization', () => {
    const key1 = ProviderCacheKeyGenerator.generateAIKey({
      requestId: 'r1',
      correlationId: 'c1',
      operation: 'CLAIM_ANALYSIS',
      input: '  GDP Grew By 2.4%  ',
      createdAt: Date.now()
    });

    const key2 = ProviderCacheKeyGenerator.generateAIKey({
      requestId: 'r2',
      correlationId: 'c2',
      operation: 'CLAIM_ANALYSIS',
      input: 'gdp grew by 2.4%',
      createdAt: Date.now()
    });

    expect(key1).toBe(key2);

    const searchKey1 = ProviderCacheKeyGenerator.generateSearchKey({
      requestId: 's1',
      correlationId: 'c1',
      query: '  Pakistan GDP  ',
      maxResults: 10,
      createdAt: Date.now()
    });

    const searchKey2 = ProviderCacheKeyGenerator.generateSearchKey({
      requestId: 's2',
      correlationId: 'c2',
      query: 'pakistan gdp',
      maxResults: 10,
      createdAt: Date.now()
    });

    expect(searchKey1).toBe(searchKey2);
  });

  it('should throw ProviderCacheKeyError on invalid request', () => {
    expect(() => ProviderCacheKeyGenerator.generateAIKey(null as unknown as AIRequest)).toThrow(ProviderCacheKeyError);
  });
});
