export type CooldownSource =
  | 'PROVIDER_RESPONSE'
  | 'RETRY_AFTER'
  | 'LOCAL_POLICY'
  | 'QUOTA_RESET'
  | 'MANUAL';

export interface ProviderCooldownState {
  readonly providerId: string;
  readonly inCooldown: boolean;
  readonly reason: string;
  readonly startedAt?: number;
  readonly expiresAt?: number;
  readonly source?: CooldownSource;
  readonly retryAfterMs?: number;
}
