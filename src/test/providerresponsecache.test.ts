import { describe, it, expect } from 'vitest';
import { ProviderResponseCache } from '../core/providers/cache/ProviderResponseCache';
import { ProviderCachePolicy } from '../core/providers/cache/ProviderCachePolicy';

describe('Module 6E: ProviderResponseCache', () => {
  it('should set, get, expire, invalidate, and clear cache entries', async () => {
    const policy = new ProviderCachePolicy({ aiTtlMs: 100, searchTtlMs: 100 });
    const cache = new ProviderResponseCache(policy);

    cache.set('key_1', 'AI', { content: 'cached AI' });
    expect(cache.get('key_1')).toEqual({ content: 'cached AI' });
    expect(cache.size()).toBe(1);

    // Test invalidation
    cache.invalidate('key_1');
    expect(cache.get('key_1')).toBeNull();

    // Test TTL expiration
    cache.set('key_2', 'SEARCH', { results: [] }, 50);
    expect(cache.get('key_2')).not.toBeNull();

    await new Promise(resolve => setTimeout(resolve, 60));
    expect(cache.get('key_2')).toBeNull();
  });
});
