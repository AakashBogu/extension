import { ISearchProvider } from '../../search/ISearchProvider';
import { SearchRequest, SearchResponse, SearchResult, SearchProviderCapabilities, SearchProviderHealth } from '../../search/SearchProviderTypes';
import { ProviderType } from '../../ProviderTypes';
import { BingConfig } from '../../config/ProviderConfiguration';
import { ProviderConfigurationValidator } from '../../config/ProviderConfigurationValidator';
import { ProviderCredentialManager } from '../../config/ProviderCredentialManager';
import { HttpClient } from '../http/HttpClient';
import { BingResponsePayload } from './SearchProviderAdapterTypes';
import { ProviderResponseError } from '../../../error/ProviderErrors';

export class BingSearchProvider implements ISearchProvider {
  public readonly id = 'search.bing';
  public readonly name = 'Bing Search Adapter';
  public readonly type: ProviderType = 'SEARCH';
  public readonly priority: number;
  public enabled: boolean;

  public readonly capabilities: SearchProviderCapabilities = {
    providerId: this.id,
    capabilities: ['WEB_SEARCH', 'NEWS_SEARCH', 'SAFE_SEARCH', 'DATE_FILTERING'],
    maxResultsPerRequest: 50,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'ja'],
    supportedRegions: ['US', 'UK', 'EU', 'JP']
  };

  private apiKey?: string;

  constructor(
    private config: BingConfig,
    private credentialManager?: ProviderCredentialManager
  ) {
    this.enabled = config.enabled;
    this.priority = config.priority;
  }

  async initialize(): Promise<void> {
    if (!this.enabled) return;
    ProviderConfigurationValidator.validateBing(this.config);
    if (this.credentialManager) {
      this.apiKey = await this.credentialManager.getCredential(this.id, this.config.credentialKey);
    }
  }

  async search(request: SearchRequest): Promise<SearchResponse> {
    if (!this.enabled) {
      throw new ProviderResponseError(`Provider [${this.id}] is disabled`, { providerId: this.id, requestId: request.requestId });
    }

    const apiKey = this.apiKey || (this.credentialManager ? await this.credentialManager.getCredential(this.id, this.config.credentialKey) : 'mock');

    const params = new URLSearchParams({
      q: request.query,
      count: String(Math.min(request.maxResults || this.config.maxResults, this.capabilities.maxResultsPerRequest))
    });

    const startTime = Date.now();
    const data = await HttpClient.request<BingResponsePayload>({
      url: `${this.config.endpoint}? ${params.toString()}`,
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey
      },
      timeoutMs: request.timeoutMs || this.config.timeoutMs,
      providerId: this.id,
      requestId: request.requestId
    });

    const rawResults = data.webPages?.value || [];
    const results: SearchResult[] = rawResults.map((r, idx) => ({
      resultId: r.id || `bing_${idx}_${Date.now()}`,
      title: r.name,
      url: r.url,
      snippet: r.snippet,
      sourceName: new URL(r.url).hostname.replace('www.', ''),
      publishedAt: r.datePublished ? new Date(r.datePublished).getTime() : undefined,
      relevanceScore: 1 - idx * 0.05,
      providerId: this.id,
      retrievedAt: Date.now()
    }));

    return {
      requestId: request.requestId,
      correlationId: request.correlationId,
      providerId: this.id,
      results,
      totalResults: results.length,
      latencyMs: Date.now() - startTime,
      createdAt: Date.now()
    };
  }

  async healthCheck(): Promise<SearchProviderHealth> {
    return {
      providerId: this.id,
      status: this.enabled ? 'HEALTHY' : 'UNHEALTHY',
      lastCheckedAt: Date.now()
    };
  }

  destroy(): void {
    this.apiKey = undefined;
  }
}
