export type ExtendedProviderHealthState = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';

export interface ProviderReliabilityMetrics {
  readonly providerId: string;
  readonly totalRequests: number;
  readonly successfulRequests: number;
  readonly failedRequests: number;
  readonly retryableFailures: number;
  readonly nonRetryableFailures: number;
  readonly successRate: number;
  readonly failureRate: number;
  readonly averageLatencyMs: number;
  readonly p50LatencyMs: number;
  readonly p95LatencyMs: number;
  readonly consecutiveFailures: number;
  readonly consecutiveSuccesses: number;
  readonly lastSuccessAt?: number;
  readonly lastFailureAt?: number;
}

export interface ProviderHealthScore {
  readonly providerId: string;
  readonly healthState: ExtendedProviderHealthState;
  readonly healthScore: number; // 0.0 to 1.0
  readonly reliabilitySubScore: number;
  readonly latencySubScore: number;
  readonly rateLimitSubScore: number;
  readonly quotaSubScore: number;
  readonly cooldownSubScore: number;
  readonly updatedAt: number;
}

export interface ProviderRoutingScore {
  readonly providerId: string;
  readonly routingScore: number; // 0.0 to 1.0
  readonly healthScore: number;
  readonly priority: number;
  readonly isEligible: boolean;
  readonly inCooldown: boolean;
  readonly isQuotaExhausted: boolean;
  readonly isRateLimited: boolean;
  readonly ineligibilityReason?: string;
  readonly calculatedAt: number;
}
