import { describe, it, expect } from 'vitest';
import { ProviderRecoveryManager } from '../core/providers/recovery/ProviderRecoveryManager';
import { ISearchProvider } from '../core/providers/search/ISearchProvider';
import { SearchRequest, SearchResponse, SearchProviderHealth } from '../core/providers/search/SearchProviderTypes';
import { ProviderError } from '../core/error/ProviderErrors';

class DummyProvider implements ISearchProvider {
  public readonly id = 'dummy';
  public readonly name = 'Dummy Provider';
  public readonly type = 'SEARCH' as const;
  public readonly capabilities = { providerId: 'dummy', capabilities: ['WEB_SEARCH' as const], maxResultsPerRequest: 10, supportedLanguages: ['en'], supportedRegions: ['US'] };
  public readonly priority = 10;
  public readonly enabled = true;
  public initCount = 0;

  async initialize(): Promise<void> { this.initCount++; }
  async search(request: SearchRequest): Promise<SearchResponse> {
    return { requestId: request.requestId, correlationId: request.correlationId, providerId: this.id, results: [], latencyMs: 10, createdAt: Date.now() };
  }
  async healthCheck(): Promise<SearchProviderHealth> { return { providerId: this.id, status: 'HEALTHY', lastCheckedAt: Date.now() }; }
  destroy(): void {}
}

describe('Module 6B: ProviderRecoveryManager', () => {
  it('should attempt provider recovery with exponential backoff and enforce max retries', async () => {
    const recovery = new ProviderRecoveryManager(2, 10, 100);
    const provider = new DummyProvider();

    await recovery.recover(provider, 'Glitch');
    expect(provider.initCount).toBe(1);

    await recovery.recover(provider, 'Glitch 2');
    expect(provider.initCount).toBe(2);

    await expect(recovery.recover(provider, 'Glitch 3')).rejects.toThrow(ProviderError);
  });
});
