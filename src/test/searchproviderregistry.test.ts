import { describe, it, expect } from 'vitest';
import { SearchProviderRegistry } from '../core/providers/registry/SearchProviderRegistry';
import { ISearchProvider } from '../core/providers/search/ISearchProvider';
import { SearchRequest, SearchResponse, SearchProviderHealth } from '../core/providers/search/SearchProviderTypes';
import { ProviderConfigurationError } from '../core/error/ProviderErrors';

class FakeSearchProvider implements ISearchProvider {
  public readonly id: string;
  public readonly name: string;
  public readonly type = 'SEARCH' as const;
  public readonly capabilities = { providerId: '', capabilities: ['WEB_SEARCH' as const], maxResultsPerRequest: 10, supportedLanguages: ['en'], supportedRegions: ['US'] };
  public readonly priority = 5;
  public enabled = true;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.capabilities.providerId = id;
  }

  async initialize(): Promise<void> {}
  async search(_request: SearchRequest): Promise<SearchResponse> {
    return { requestId: _request.requestId, correlationId: _request.correlationId, providerId: this.id, results: [], latencyMs: 10, createdAt: Date.now() };
  }
  async healthCheck(): Promise<SearchProviderHealth> { return { providerId: this.id, status: 'HEALTHY', lastCheckedAt: Date.now() }; }
  destroy(): void {}
}

describe('Module 6B: SearchProviderRegistry', () => {
  it('should register, lookup, list, and unregister search providers', async () => {
    const registry = new SearchProviderRegistry();
    const provider = new FakeSearchProvider('s_1', 'Fake Search Provider');

    await registry.register(provider);
    expect(registry.has('s_1')).toBe(true);
    expect(registry.get('s_1')).toBe(provider);
    expect(registry.getEnabled().length).toBe(1);

    await registry.unregister('s_1');
    expect(registry.has('s_1')).toBe(false);
  });

  it('should reject duplicate search provider registration', async () => {
    const registry = new SearchProviderRegistry();
    const provider = new FakeSearchProvider('s_dup', 'Duplicate Search');

    await registry.register(provider);
    await expect(registry.register(provider)).rejects.toThrow(ProviderConfigurationError);
  });
});
