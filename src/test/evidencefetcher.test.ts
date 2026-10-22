import { describe, it, expect, vi } from 'vitest';
import { EvidenceFetcher } from '../core/verification/fetcher/EvidenceFetcher';
import { ProviderExecutionEngine } from '../core/providers/execution/ProviderExecutionEngine';
import { SearchQuerySpec } from '../core/verification/VerificationTypes';

describe('EvidenceFetcher', () => {
  const mockExecuteSearch = vi.fn();
  const mockExecutionEngine = {
    executeSearch: mockExecuteSearch
  } as unknown as ProviderExecutionEngine;

  const queries: SearchQuerySpec[] = [
    { queryId: 'q1', claimId: 'claim_1', queryText: 'Water on Mars NASA', queryType: 'KEYWORD', weight: 1.0 },
    { queryId: 'q2', claimId: 'claim_1', queryText: 'Is there water on Mars', queryType: 'COUNTER_FACTUAL', weight: 0.8 }
  ];

  it('fetches and normalizes raw search results via ProviderExecutionEngine', async () => {
    mockExecuteSearch.mockImplementation((req: { query: string; requestId: string; correlationId: string }) => {
      if (req.query.includes('Water on Mars')) {
        return Promise.resolve({
          requestId: req.requestId,
          correlationId: req.correlationId,
          providerId: 'search.brave',
          results: [
            { resultId: 'r1', title: 'NASA Finds Water', url: 'https://nasa.gov/mars', snippet: 'Liquid water detected.', sourceName: 'NASA', providerId: 'search.brave', retrievedAt: Date.now() }
          ],
          latencyMs: 120,
          createdAt: Date.now()
        });
      }
      return Promise.resolve({
        requestId: req.requestId,
        correlationId: req.correlationId,
        providerId: 'search.bing',
        results: [
          { resultId: 'r2', title: 'Mars Water Discovery', url: 'https://bbc.com/news/mars', snippet: 'BBC reports water on Mars.', sourceName: 'BBC', providerId: 'search.bing', retrievedAt: Date.now() }
        ],
        latencyMs: 140,
        createdAt: Date.now()
      });
    });

    const fetcher = new EvidenceFetcher(mockExecutionEngine);
    const evidence = await fetcher.fetchEvidence(queries);

    expect(evidence).toHaveLength(2);
    expect(evidence[0].sourceName).toBe('NASA');
    expect(evidence[1].sourceName).toBe('BBC');
  });

  it('handles partial search query failures gracefully without throwing', async () => {
    mockExecuteSearch
      .mockResolvedValueOnce({
        requestId: 'r1',
        correlationId: 'c1',
        providerId: 'search.brave',
        results: [{ resultId: 'r1', title: 'Success Result', url: 'https://apnews.com/1', snippet: 'Details', providerId: 'search.brave', retrievedAt: Date.now() }],
        latencyMs: 100,
        createdAt: Date.now()
      })
      .mockRejectedValueOnce(new Error('Search Provider Timeout'));

    const fetcher = new EvidenceFetcher(mockExecutionEngine);
    const evidence = await fetcher.fetchEvidence(queries);

    expect(evidence).toHaveLength(1);
    expect(evidence[0].title).toBe('Success Result');
  });
});
