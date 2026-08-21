# Provider Cooldown & Recovery Manager - Interfaces & Type Contracts

```typescript
export interface ExtendedProviderCooldownState extends ProviderCooldownState {
  readonly providerId: string;
  readonly modelId?: string;
  readonly inCooldown: boolean;
  readonly status: CooldownStatus;
  readonly reason: string;
  readonly startedAt: number;
  readonly expiresAt: number;
  readonly durationMs: number;
  readonly source: CooldownSource;
  readonly retryAfterMs?: number;
  readonly consecutiveFailureCount: number;
  readonly recoveryAttempts: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}
```
