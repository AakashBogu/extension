import { RateLimitWindow } from './ProviderRateLimitTypes';

export interface AggregateUsageMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  attemptCount: number;
  retryCount: number;
  fallbackCount: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  totalDurationMs: number;
  averageDurationMs: number;
  currentConcurrentRequests: number;
  peakConcurrentRequests: number;
}

export interface ProviderUsageSnapshot {
  readonly providerId: string;
  readonly modelId?: string;
  readonly timestamp: number;
  readonly metrics: Readonly<AggregateUsageMetrics>;
  readonly window?: RateLimitWindow;
}

export interface UsageBucket {
  readonly window: RateLimitWindow;
  readonly startTime: number;
  readonly endTime: number;
  readonly metrics: AggregateUsageMetrics;
}
