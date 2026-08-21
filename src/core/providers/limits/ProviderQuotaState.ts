import { QuotaConsumption, QuotaAllocation } from './ProviderQuotaTypes';
import { ProviderUsageRecord } from './ProviderUsageTypes';

export type QuotaUtilizationLevel = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EXHAUSTED';

export interface ExtendedQuotaConsumption extends QuotaConsumption {
  readonly allocation: QuotaAllocation;
  readonly consumedAmount: number;
  readonly remainingAmount: number;
  readonly resetTimestamp: number;
  readonly isExhausted: boolean;
  readonly utilizationRatio: number;
  readonly level: QuotaUtilizationLevel;
  readonly isLimiting: boolean;
  readonly windowStart: number;
  readonly windowEnd: number;
}

export interface ProviderQuotaDecision {
  readonly decision: 'ALLOWED' | 'QUOTA_EXHAUSTED' | 'QUOTA_WARNING';
  readonly providerId: string;
  readonly reason: string;
  readonly reservationId?: string;
  readonly remainingAmount: number;
  readonly resetTimestamp: number;
}

export interface ProviderQuotaRemaining {
  readonly requestsRemaining: number;
  readonly tokensRemaining: number;
  readonly costRemaining: number;
}

export interface ProviderQuotaReservation {
  readonly reservationId: string;
  readonly providerId: string;
  readonly modelId?: string;
  readonly estimatedRequests: number;
  readonly estimatedTokens?: number;
  readonly estimatedCost?: number;
  readonly createdAt: number;
  readonly expiresAt: number;
}

export interface ProviderQuotaReservationHandle {
  readonly reservationId: string;
  readonly providerId: string;
  release: () => boolean;
  commit: (usage: ProviderUsageRecord) => boolean;
}
