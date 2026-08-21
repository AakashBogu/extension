# Provider Cooldown & Recovery Manager - Public API Specifications

```typescript
export class ProviderCooldownManager {
  initialize(): Promise<void>;
  getCooldown(providerId: string, modelId?: string): ExtendedProviderCooldownState | null;
  isInCooldown(providerId: string, modelId?: string): boolean;
  getRemainingCooldownMs(providerId: string, modelId?: string): number;
  startCooldown(providerId: string, source: CooldownSource, reason: string, retryAfterMs?: number, modelId?: string): ExtendedProviderCooldownState;
  extendCooldown(providerId: string, additionalMs: number, reason?: string, modelId?: string): ExtendedProviderCooldownState;
  clearCooldown(providerId: string, modelId?: string): boolean;
  recordFailure(providerId: string, error: unknown, modelId?: string): ExtendedProviderCooldownState | null;
  recordSuccess(providerId: string, modelId?: string): void;
  evaluate(providerId: string, modelId?: string): { inCooldown: boolean; state: ExtendedProviderCooldownState | null };
  getActiveCooldowns(): ExtendedProviderCooldownState[];
  getStatus(): ProviderCooldownManagerStatus;
  healthCheck(): Promise<ProviderCooldownHealth>;
  reset(): void;
  destroy(): void;
}
```
