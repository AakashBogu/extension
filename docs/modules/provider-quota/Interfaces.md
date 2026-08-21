# Provider Quota Manager & Routing Integration - Interfaces & Type Contracts

```typescript
export interface ProviderQuotaDecision {
  readonly decision: "ALLOWED" | "QUOTA_EXHAUSTED" | "QUOTA_WARNING";
  readonly providerId: string;
  readonly reason: string;
  readonly reservationId?: string;
  readonly remainingAmount: number;
  readonly resetTimestamp: number;
}
```
