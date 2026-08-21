# Provider Reliability / Recovery & Circuit-Breaker Integration - Public API Specifications

```typescript
export class ProviderReliabilityRecoveryManager {
  getCircuitState(providerId: string): CircuitState;
  getCircuitRecord(providerId: string): ProviderCircuitRecord;
  recordSuccess(providerId: string, latencyMs?: number): void;
  recordFailure(providerId: string, error: unknown, latencyMs?: number): void;
  evaluateAdmission(providerId: string, isProbe?: boolean): { allowed: boolean; decision: string; reason: string; retryAt?: number };
  canProbe(providerId: string): boolean;
  startProbe(providerId: string): string | null;
  finishProbe(providerId: string, probeId: string, success: boolean): void;
  reset(providerId?: string): void;
  destroy(): void;
}
```
