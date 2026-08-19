import { describe, it, expect } from 'vitest';
import { ProviderResponseCache } from '../core/providers/cache/ProviderResponseCache';
import { ProviderCachePolicy } from '../core/providers/cache/ProviderCachePolicy';

describe('Module 6E: ProviderCacheEvictionManager & LRU', () => {
  it('should evict LRU entries when maxEntries limit is exceeded', () => {
    const policy = new ProviderCachePolicy({ maxEntries: 2 });
    const cache = new ProviderResponseCache(policy);

    cache.set('k1', 'AI', { val: 1 });
    cache.set('k2', 'AI', { val: 2 });

    // Access k1 so k2 becomes LRU
    cache.get('k1');

    // Insert k3 -> causes eviction of k2
    cache.set('k3', 'AI', { val: 3 });

    expect(cache.get('k1')).not.toBeNull();
    expect(cache.get('k2')).toBeNull();
    expect(cache.get('k3')).not.toBeNull();
  });
});
