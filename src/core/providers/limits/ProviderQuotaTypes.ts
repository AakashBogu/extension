export type QuotaScope = 'GLOBAL' | 'PROVIDER' | 'MODEL' | 'TENANT';

export type QuotaDimension = 'REQUESTS' | 'TOKENS' | 'COST';

export type QuotaPeriod = 'DAILY' | 'MONTHLY' | 'CUSTOM';

export interface QuotaAllocation {
  readonly scope: QuotaScope;
  readonly dimension: QuotaDimension;
  readonly allocatedLimit: number;
  readonly period: QuotaPeriod;
  readonly customPeriodMs?: number;
}

export interface QuotaConsumption {
  readonly allocation: QuotaAllocation;
  readonly consumedAmount: number;
  readonly remainingAmount: number;
  readonly resetTimestamp: number;
  readonly isExhausted: boolean;
}

export interface ProviderQuotaState {
  readonly providerId: string;
  readonly timestamp: number;
  readonly quotas: ReadonlyArray<QuotaConsumption>;
}
