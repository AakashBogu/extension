import { ProviderCooldownState, CooldownSource } from './ProviderCooldownTypes';
import { ProviderHealthStatus } from '../ProviderTypes';

export type CooldownStatus = 'NONE' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'RECOVERING' | 'RECOVERED';

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

export interface ProviderCooldownManagerStatus {
  totalActiveCooldowns: number;
  totalCooldownsTriggered: number;
  totalRecoveriesAttempted: number;
  totalRecoveriesSucceeded: number;
  lastCooldownAt: number;
}

export interface ProviderCooldownHealth {
  status: ProviderHealthStatus;
  activeCooldownCount: number;
  lastCheckedAt: number;
}
