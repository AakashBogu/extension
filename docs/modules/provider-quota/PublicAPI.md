# Provider Quota Manager & Routing Integration - Public API Specifications

```typescript
export class ProviderQuotaManager {
  initialize(): Promise<void>;
  configureQuotaPolicy(providerId: string, policy: ProviderQuotaPolicy): void;
  getQuotaState(providerId: string, modelId?: string): ProviderQuotaState | null;
  evaluate(providerId: string, request: AIRequest | SearchRequest, modelId?: string): ProviderQuotaDecision;
  isExhausted(providerId: string, modelId?: string): boolean;
  getRemaining(providerId: string, modelId?: string): ProviderQuotaRemaining;
  reserve(providerId: string, estimatedRequests?: number, estimatedTokens?: number, estimatedCost?: number, modelId?: string): ProviderQuotaReservationHandle;
  release(reservationId: string): boolean;
  commit(reservationId: string, usage: ProviderUsageRecord): boolean;
  refresh(providerId: string, modelId?: string): ProviderQuotaState;
  reset(providerId?: string): void;
  getAllStates(): ProviderQuotaState[];
  shutdown(): Promise<void>;
  destroy(): void;
}
```
