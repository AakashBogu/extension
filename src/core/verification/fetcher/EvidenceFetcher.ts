import { SearchQuerySpec, RawEvidenceItem } from '../VerificationTypes';
import { ProviderExecutionEngine } from '../../providers/execution/ProviderExecutionEngine';
import { EvidenceFetchingError } from '../../error/VerificationErrors';
import { SearchRequest } from '../../providers/search/SearchProviderTypes';
import { VerificationRequestSanitizer } from '../VerificationRequestSanitizer';

export class EvidenceFetcher {
  constructor(
    private readonly executionEngine: ProviderExecutionEngine,
    private readonly sanitizer: VerificationRequestSanitizer = new VerificationRequestSanitizer()
  ) {}

  /**
   * Fetches raw search evidence for a set of SearchQuerySpecs.
   * Reuses Module 6 ProviderExecutionEngine search routing, admission, quota, and caching.
   * Handles partial source failures gracefully.
   */
  public async fetchEvidence(
    queries: SearchQuerySpec[],
    maxResultsPerQuery: number = 5,
    correlationId?: string,
    abortSignal?: AbortSignal
  ): Promise<RawEvidenceItem[]> {
    if (!queries || queries.length === 0) {
      return [];
    }

    const corrId = correlationId || `corr_fetch_${Date.now()}`;
    const evidenceItems: RawEvidenceItem[] = [];

    // Execute queries in parallel using Promise.allSettled for partial failure tolerance
    const searchPromises = queries.map(async querySpec => {
      if (abortSignal?.aborted) {
        throw new EvidenceFetchingError(`Search execution aborted for query: ${querySpec.queryId}`);
      }

      const cleanQuery = this.sanitizer.sanitizeQuery(querySpec.queryText);
      if (!cleanQuery) {
        return { querySpec, response: null };
      }

      const searchRequest: SearchRequest = {
        requestId: `req_search_${querySpec.queryId}_${Date.now()}`,
        correlationId: corrId,
        query: cleanQuery,
        maxResults: maxResultsPerQuery,
        createdAt: Date.now()
      };

      const response = await this.executionEngine.executeSearch(searchRequest);
      return { querySpec, response };
    });

    const results = await Promise.allSettled(searchPromises);

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { querySpec, response } = result.value;
        if (response && response.results) {
          for (const item of response.results) {
            evidenceItems.push({
              evidenceId: `ev_${querySpec.queryId}_${item.resultId}`,
              claimId: querySpec.claimId,
              queryId: querySpec.queryId,
              title: item.title || '',
              url: item.url || '',
              snippet: item.snippet || '',
              sourceName: item.sourceName || item.providerId || 'Unknown Source',
              publishedAt: item.publishedAt,
              providerId: item.providerId || response.providerId,
              retrievedAt: item.retrievedAt || Date.now()
            });
          }
        }
      } else {
        // Log or record partial query failure silently without failing entire pipeline
      }
    }

    return evidenceItems;
  }
}
