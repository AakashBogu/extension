import { ProviderHealthStatus } from '../ProviderTypes';

export interface CacheEntry<T = unknown> {
  cacheKey: string;
  requestType: 'AI' | 'SEARCH';
  response: T;
  createdAt: number;
  expiresAt: number;
  lastAccessedAt: number;
  accessSeq: number;
  accessCount: number;
  approximateSize: number;
  providerId?: string;
}

export interface ProviderCacheMetrics {
  cacheHits: number;
  cacheMisses: number;
  expiredEntries: number;
  evictions: number;
  invalidations: number;
  insertions: number;
  currentEntries: number;
  approximateSize: number;
  inFlightRequests: number;
  deduplicatedRequests: number;
  cacheHitRate: number;
}

export interface ProviderCacheHealth {
  status: ProviderHealthStatus;
  currentEntries: number;
  approximateSize: number;
  evictionPressure: boolean;
  lastCheckedAt: number;
}
