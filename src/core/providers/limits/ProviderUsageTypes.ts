export interface ProviderUsageRecord {
  readonly recordId: string;
  readonly providerId: string;
  readonly requestId: string;
  readonly operationType?: string;
  readonly requestCount: number;
  readonly inputTokens?: number;
  readonly outputTokens?: number;
  readonly totalTokens?: number;
  readonly estimatedCost?: number;
  readonly durationMs: number;
  readonly timestamp: number;
  readonly cacheHit?: boolean;
  readonly metadata?: Readonly<Record<string, number | string | boolean>>;
}
