# Provider Execution & Request Orchestration Engine - Interfaces & Type Contracts

```typescript
export interface ProviderRequestStatus {
  requestId: string;
  requestType: "AI" | "SEARCH";
  state: RequestLifecycleState;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  providerId?: string;
  attemptCount: number;
  timeoutMs: number;
  cancelled: boolean;
  error?: string;
}
```
