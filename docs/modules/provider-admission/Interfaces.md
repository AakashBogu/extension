# Provider Admission Controller - Interfaces & Type Contracts

```typescript
export interface AdmissionResult {
  readonly providerId: string;
  readonly decision: AdmissionDecision;
  readonly reason: string;
  readonly checkedAt: number;
  readonly retryAt?: number;
  readonly remainingCapacity?: number;
  readonly reservationId?: string;
}
```
