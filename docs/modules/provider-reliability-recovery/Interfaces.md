# Provider Reliability / Recovery & Circuit-Breaker Integration - Interfaces & Type Contracts

```typescript
export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface ProviderCircuitRecord {
  readonly providerId: string;
  readonly state: CircuitState;
  readonly consecutiveFailures: number;
  readonly consecutiveSuccesses: number;
  readonly totalSuccesses: number;
  readonly totalFailures: number;
  readonly rollingFailureRate: number;
  readonly rollingSampleCount: number;
  readonly lastFailureAt?: number;
  readonly lastSuccessAt?: number;
  readonly stateChangedAt: number;
  readonly openUntil?: number;
  readonly halfOpenProbeInFlight: boolean;
  readonly recoveryAttemptCount: number;
}
```
