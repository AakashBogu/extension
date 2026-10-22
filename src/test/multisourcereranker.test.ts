import { describe, it, expect } from 'vitest';
import { MultiSourceReranker } from '../core/verification/reranker/MultiSourceReranker';
import { RawEvidenceItem, SanitizedVerificationRequest } from '../core/verification/VerificationTypes';

describe('MultiSourceReranker', () => {
  const reranker = new MultiSourceReranker();

  const dummyRequest: SanitizedVerificationRequest = {
    claimId: 'claim_303',
    claimText: 'NASA discovered water ice on Mars',
    normalizedText: 'nasa discovered water ice on mars',
    classification: ['FACTUAL'],
    verifiability: 'HIGH',
    priority: 'HIGH',
    entities: [{ type: 'ORGANIZATION', text: 'NASA' }, { type: 'LOCATION', text: 'Mars' }],
    confidence: 0.9,
    createdAt: Date.now()
  };

  const rawItems: RawEvidenceItem[] = [
    {
      evidenceId: 'e1',
      claimId: 'claim_303',
      queryId: 'q1',
      title: 'Blog post about Mars',
      url: 'https://randomblog.com/mars?utm_source=twitter',
      snippet: 'Mars is red and cool.',
      sourceName: 'RandomBlog',
      publishedAt: Date.now() - 86400000 * 300,
      providerId: 'search.bing',
      retrievedAt: Date.now()
    },
    {
      evidenceId: 'e2',
      claimId: 'claim_303',
      queryId: 'q1',
      title: 'NASA confirms water ice on Mars',
      url: 'https://nasa.gov/news/mars-water',
      snippet: 'NASA instruments confirm water ice on Mars surface.',
      sourceName: 'NASA',
      publishedAt: Date.now() - 86400000 * 10,
      providerId: 'search.brave',
      retrievedAt: Date.now()
    },
    {
      evidenceId: 'e3',
      claimId: 'claim_303',
      queryId: 'q2',
      title: 'NASA confirms water ice on Mars (Duplicate)',
      url: 'https://nasa.gov/news/mars-water/',
      snippet: 'NASA instruments confirm water ice on Mars surface in detail.',
      sourceName: 'NASA',
      publishedAt: Date.now() - 86400000 * 10,
      providerId: 'search.brave',
      retrievedAt: Date.now()
    }
  ];

  it('deduplicates evidence by canonical URL and ranks trusted domains higher', () => {
    const ranked = reranker.rerank(rawItems, dummyRequest);

    // e2 and e3 canonicalize to the same URL, so deduplication keeps one
    expect(ranked).toHaveLength(2);
    expect(ranked[0].evidence.url).toContain('nasa.gov');
    expect(ranked[0].credibilityScore).toBe(1.0);
    expect(ranked[0].rank).toBe(1);
  });

  it('guarantees 100% deterministic ordering for identical inputs', () => {
    const run1 = reranker.rerank(rawItems, dummyRequest);
    const run2 = reranker.rerank(rawItems, dummyRequest);

    expect(run1).toEqual(run2);
  });

  it('canonicalizes URLs stripping tracking parameters and trailing slashes', () => {
    const canonical = reranker.toCanonicalUrl('HTTPS://www.Reuters.com/article/123/?utm_source=rss&utm_medium=feed#section');
    expect(canonical).toBe('https://reuters.com/article/123');
  });
});
