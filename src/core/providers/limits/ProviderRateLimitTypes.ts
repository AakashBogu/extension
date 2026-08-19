export type RateLimitDimension = 'REQUESTS' | 'TOKENS' | 'CONCURRENT_REQUESTS' | 'COST';

export type RateLimitWindow = 'SECOND' | 'MINUTE' | 'HOUR' | 'DAY' | 'MONTH' | 'CUSTOM';

export type RateLimitScope = 'GLOBAL' | 'PROVIDER' | 'MODEL' | 'OPERATION';

export interface RateLimitDefinition {
  readonly dimension: RateLimitDimension;
  readonly window: RateLimitWindow;
  readonly limit: number;
  readonly customWindowMs?: number;
  readonly scope?: RateLimitScope;
}

export interface RateLimitState {
  readonly definition: RateLimitDefinition;
  readonly currentUsage: number;
  readonly remainingCapacity: number;
  readonly resetTimestamp: number;
}

export interface ProviderRateLimitSnapshot {
  readonly providerId: string;
  readonly timestamp: number;
  readonly limits: ReadonlyArray<RateLimitState>;
}
