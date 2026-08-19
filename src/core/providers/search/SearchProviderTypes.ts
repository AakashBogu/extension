import { ProviderHealth, ProviderType } from '../ProviderTypes';

export type SearchCapabilityFlag =
  | 'WEB_SEARCH'
  | 'NEWS_SEARCH'
  | 'DATE_FILTERING'
  | 'DOMAIN_FILTERING'
  | 'REGION_FILTERING'
  | 'LANGUAGE_FILTERING'
  | 'SAFE_SEARCH'
  | 'RESULT_RANKING';

export interface SearchRequest {
  requestId: string;
  correlationId: string;
  query: string;
  maxResults: number;
  language?: string;
  region?: string;
  safeSearch?: boolean;
  timeoutMs?: number;
  createdAt: number;
}

export interface SearchResult {
  resultId: string;
  title: string;
  url: string;
  snippet: string;
  sourceName: string;
  publishedAt?: number;
  relevanceScore?: number;
  providerId: string;
  retrievedAt: number;
}

export interface SearchResponse {
  requestId: string;
  correlationId: string;
  providerId: string;
  results: SearchResult[];
  totalResults?: number;
  latencyMs: number;
  createdAt: number;
}

export interface SearchProviderCapabilities {
  providerId: string;
  capabilities: SearchCapabilityFlag[];
  maxResultsPerRequest: number;
  supportedLanguages: string[];
  supportedRegions: string[];
}

export interface SearchProviderHealth extends ProviderHealth {
  activeSearchCount?: number;
  totalQueriesExecuted?: number;
}

export interface SearchProviderMetadata {
  id: string;
  name: string;
  version: string;
  type: ProviderType;
  capabilities: SearchProviderCapabilities;
  priority: number;
  enabled: boolean;
}

export interface SearchProviderConfiguration {
  enabled: boolean;
  defaultMaxResults: number;
  defaultTimeoutMs: number;
  safeSearchDefault: boolean;
}
