import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BraveSearchProvider } from '../core/providers/adapters/search/BraveSearchProvider';

describe('Module 6C: BraveSearchProvider Adapter', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should process Brave search request and normalize search results', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        web: {
          results: [
            { title: 'Brave News Item', url: 'https://news.example.com/item1', description: 'Snippet text here' }
          ]
        }
      })
    } as unknown as Response);

    const provider = new BraveSearchProvider({
      enabled: true,
      endpoint: 'https://api.search.brave.com/res/v1/web/search',
      maxResults: 5,
      timeoutMs: 5000,
      priority: 10
    });

    await provider.initialize();
    const response = await provider.search({
      requestId: 'brave_req_1',
      correlationId: 'corr_1',
      query: 'Brave query',
      maxResults: 5,
      createdAt: Date.now()
    });

    expect(response.providerId).toBe('search.brave');
    expect(response.results.length).toBe(1);
    expect(response.results[0].title).toBe('Brave News Item');
    expect(response.results[0].sourceName).toBe('news.example.com');
  });
});
