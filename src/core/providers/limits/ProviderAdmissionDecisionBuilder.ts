import { AdmissionResult, AdmissionDecision } from './ProviderAdmissionTypes';
import { CooldownSource } from './ProviderCooldownTypes';
import { RateLimitDimension, RateLimitWindow } from './ProviderRateLimitTypes';

export interface AdmissionDecisionOptions {
  providerId: string;
  decision: AdmissionDecision;
  reason: string;
  retryAt?: number;
  remainingCapacity?: number;
  limitingDimension?: RateLimitDimension;
  limitingWindow?: RateLimitWindow;
  currentUsage?: number;
  configuredLimit?: number;
  utilizationRatio?: number;
  quotaRemaining?: number;
  cooldownSource?: CooldownSource;
}

export class ProviderAdmissionDecisionBuilder {
  static build(options: AdmissionDecisionOptions): AdmissionResult {
    return {
      providerId: options.providerId,
      decision: options.decision,
      reason: options.reason,
      checkedAt: Date.now(),
      retryAt: options.retryAt,
      remainingCapacity: options.remainingCapacity
    };
  }
}
