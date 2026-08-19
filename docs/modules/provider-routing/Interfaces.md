# AI & Search Provider Registries & Routing Layer - Interfaces & Type Contracts

```typescript
export interface ProviderHealthRecord {
  providerId: string;
  status: ProviderHealthStatus;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastCheckedAt: number;
  latencyMs?: number;
  lastError?: string;
}
```
