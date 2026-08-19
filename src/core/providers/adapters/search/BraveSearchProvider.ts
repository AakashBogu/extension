import { ISearchProvider } from '../../search/ISearchProvider';
import { SearchRequest, SearchResponse, SearchResult, SearchProviderCapabilities, SearchProviderHealth } from '../../search/SearchProviderTypes';
import { ProviderType } from '../../ProviderTypes';
import { BraveConfig } from '../../config/ProviderConfiguration';
import { ProviderConfigurationValidator } from '../../config/ProviderConfigurationValidator';
import { ProviderCredentialManager } from '../../config/ProviderCredentialManager';
import { HttpClient } from '../http/HttpClient';
import { BraveResponsePayload } from './SearchProviderAdapterTypes';
import { ProviderResponseError } from '../../../error/ProviderErrors';

export class BraveSearchProvider implements ISearchProvider {
  public readonly id = 'search.brave';
  public readonly name = 'Brave Search Adapter';
  public readonly type: ProviderType = 'SEARCH';
  public readonly priority: number;
  public enabled: boolean;

  public readonly capabilities: SearchProviderCapabilities = {
    providerId: this.id,
    capabilities: ['WEB_SEARCH', 'NEWS_SEARCH', 'SAFE_SEARCH'],
    maxResultsPerRequest: 20,
    supportedLanguages: ['en', 'es', 'fr', 'de'],
    supportedRegions: ['US', 'UK', 'EU']
  };

  private apiKey?: string;

  constructor(
    private config: BraveConfig,
    private credentialManager?: ProviderCredentialManager
  ) {
    this.enabled = config.enabled;
    this.priority = config.priority;
  }

  async initialize(): Promise<void> {
    if (!this.enabled) return;
    ProviderConfigurationValidator.validateBrave(this.config);
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
    const data = await HttpClient.request<BraveResponsePayload>({
      url: `${this.config.endpoint}? ${params.toString()}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey
      },
      timeoutMs: request.timeoutMs || this.config.timeoutMs,
      providerId: this.id,
      requestId: request.requestId
    });

    const rawResults = data.web?.results || [];
    const results: SearchResult[] = rawResults.map((r, idx) => ({
      resultId: `brave_${idx}_${Date.now()}`,
      title: r.title,
      url: r.url,
      snippet: r.description,
      sourceName: new URL(r.url).hostname.replace('www.', ''),
      publishedAt: r.page_age ? new Date(r.page_age).getTime() : undefined,
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
