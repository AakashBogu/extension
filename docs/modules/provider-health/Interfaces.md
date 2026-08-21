# Provider Health, Reliability & Quota-Aware Routing Scoring - Interfaces & Type Contracts

```typescript
export interface ProviderHealthScore {
  readonly providerId: string;
  readonly healthState: ExtendedProviderHealthState;
  readonly healthScore: number;
  readonly reliabilitySubScore: number;
  readonly latencySubScore: number;
  readonly rateLimitSubScore: number;
  readonly quotaSubScore: number;
  readonly cooldownSubScore: number;
  readonly updatedAt: number;
}

export interface ProviderRoutingScore {
  readonly providerId: string;
  readonly routingScore: number;
  readonly healthScore: number;
  readonly priority: number;
  readonly isEligible: boolean;
  readonly inCooldown: boolean;
  readonly isQuotaExhausted: boolean;
  readonly isRateLimited: boolean;
  readonly ineligibilityReason?: string;
  readonly calculatedAt: number;
}
```
