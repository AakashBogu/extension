# Provider Health, Reliability & Quota-Aware Routing Scoring - Public API Specifications

```typescript
export class ProviderHealthManager {
  getHealth(providerId: string): ProviderHealthStatus;
  getHealthRecord(providerId: string): ProviderHealthRecord | undefined;
  recordSuccess(providerId: string, latencyMs: number): void;
  recordFailure(providerId: string, error: string, retryable?: boolean): void;
  getMetrics(providerId: string): ProviderReliabilityMetrics;
  getHealthScore(providerId: string, inCooldown?: boolean, isRateLimited?: boolean, isQuotaExhausted?: boolean): ProviderHealthScore;
  getRoutingScore(providerId: string, priority: number, inCooldown?: boolean, isQuotaExhausted?: boolean, isRateLimited?: boolean, enabled?: boolean): ProviderRoutingScore;
  rankProviders<T extends { id: string; priority: number; enabled?: boolean }>(providers: T[], cooldownManager?: any, quotaManager?: any, rateLimitTracker?: any): Array<{ provider: T; score: ProviderRoutingScore }>;
  clear(providerId?: string): void;
}
```
