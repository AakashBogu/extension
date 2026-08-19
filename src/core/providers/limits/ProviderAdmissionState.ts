import { ProviderHealthStatus } from '../ProviderTypes';

export interface ProviderAdmissionState {
  status: 'IDLE' | 'INITIALIZING' | 'READY' | 'STOPPED' | 'DESTROYED';
  totalEvaluations: number;
  totalAllowed: number;
  totalDenied: number;
  totalRateLimited: number;
  totalQuotaExhausted: number;
  totalCooldown: number;
  totalCapacityExceeded: number;
  totalDisabled: number;
  lastEvaluatedAt: number;
}

export interface ProviderAdmissionHealth {
  status: ProviderHealthStatus;
  denialRate: number;
  lastCheckedAt: number;
}
