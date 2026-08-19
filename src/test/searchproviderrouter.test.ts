import { describe, it, expect } from 'vitest';
import { SearchProviderRegistry } from '../core/providers/registry/SearchProviderRegistry';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';
import { SearchProviderRouter } from '../core/providers/router/SearchProviderRouter';
import { ISearchProvider } from '../core/providers/search/ISearchProvider';
import { SearchRequest, SearchResponse, SearchCapabilityFlag, SearchProviderHealth } from '../core/providers/search/SearchProviderTypes';
import { ProviderCapabilityError } from '../core/error/ProviderErrors';

class TestSearchProvider implements ISearchProvider {
  public readonly id: string;
  public readonly name: string;
  public readonly type = 'SEARCH' as const;
  public readonly capabilities;
  public readonly priority: number;
  public enabled = true;

  constructor(id: string, priority: number, capabilities: SearchCapabilityFlag[]) {
    this.id = id;
    this.name = id;
    this.priority = priority;
    this.capabilities = { providerId: id, capabilities, maxResultsPerRequest: 10, supportedLanguages: ['en'], supportedRegions: ['US'] };
  }

  async initialize(): Promise<void> {}
  async search(request: SearchRequest): Promise<SearchResponse> {
    return { requestId: request.requestId, correlationId: request.correlationId, providerId: this.id, results: [], latencyMs: 10, createdAt: Date.now() };
  }
  async healthCheck(): Promise<SearchProviderHealth> { return { providerId: this.id, status: 'HEALTHY', lastCheckedAt: Date.now() }; }
  destroy(): void {}
}

describe('Module 6B: SearchProviderRouter', () => {
  it('should select highest priority capable search provider', async () => {
    const registry = new SearchProviderRegistry();
    const health = new ProviderHealthManager();

    const lowP = new TestSearchProvider('search_low', 10, ['WEB_SEARCH']);
    const highP = new TestSearchProvider('search_high', 100, ['WEB_SEARCH']);

    await registry.register(lowP);
    await registry.register(highP);

    const router = new SearchProviderRouter(registry, health);
    const selected = router.selectProvider({ requestId: 'r1', correlationId: 'c1', query: 'test', maxResults: 5, createdAt: Date.now() }, ['WEB_SEARCH']);

    expect(selected.id).toBe('search_high');
  });

  it('should throw ProviderCapabilityError if no search provider supports required capabilities', async () => {
    const registry = new SearchProviderRegistry();
    const health = new ProviderHealthManager();

    const p1 = new TestSearchProvider('p1', 10, ['WEB_SEARCH']);
    await registry.register(p1);

    const router = new SearchProviderRouter(registry, health);
    expect(() => router.selectProvider({ requestId: 'r1', correlationId: 'c1', query: 'test', maxResults: 5, createdAt: Date.now() }, ['NEWS_SEARCH'])).toThrow(ProviderCapabilityError);
  });
});
