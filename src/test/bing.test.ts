import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BingSearchProvider } from '../core/providers/adapters/search/BingSearchProvider';

describe('Module 6C: BingSearchProvider Adapter', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should process Bing search request and normalize search results', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        webPages: {
          value: [
            { id: 'bing_res_1', name: 'Bing News Article', url: 'https://bingnews.com/art1', snippet: 'Bing snippet' }
          ]
        }
      })
    } as unknown as Response);

    const provider = new BingSearchProvider({
      enabled: true,
      endpoint: 'https://api.bing.microsoft.com/v7.0/search',
      maxResults: 5,
      timeoutMs: 5000,
      priority: 10
    });

    await provider.initialize();
    const response = await provider.search({
      requestId: 'bing_req_1',
      correlationId: 'corr_1',
      query: 'Bing query',
      maxResults: 5,
      createdAt: Date.now()
    });

    expect(response.providerId).toBe('search.bing');
    expect(response.results.length).toBe(1);
    expect(response.results[0].title).toBe('Bing News Article');
    expect(response.results[0].sourceName).toBe('bingnews.com');
  });
});
