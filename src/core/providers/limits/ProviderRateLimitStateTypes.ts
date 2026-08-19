import { RateLimitState, RateLimitDefinition } from './ProviderRateLimitTypes';

export type UtilizationLevel = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EXHAUSTED';

export interface ExtendedRateLimitState extends RateLimitState {
  readonly definition: RateLimitDefinition;
  readonly currentUsage: number;
  readonly remainingCapacity: number;
  readonly resetTimestamp: number;
  readonly utilizationRatio: number;
  readonly isExhausted: boolean;
  readonly level: UtilizationLevel;
  readonly isLimiting: boolean;
  readonly windowStart: number;
  readonly windowEnd: number;
}
