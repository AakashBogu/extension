import { CooldownSource } from './ProviderCooldownTypes';
import { ProviderCooldownPolicy } from './ProviderCooldownPolicy';
import { ProviderRateLimitError, ProviderQuotaError } from '../../error/ProviderLimitErrors';
import { ProviderRequestError } from '../../error/ProviderErrors';
import { ProviderRequestTimeoutError } from '../../error/ProviderExecutionErrors';

export class ProviderCooldownEvaluator {
  static calculateBackoffDuration(
    consecutiveFailures: number,
    policy: ProviderCooldownPolicy
  ): number {
    const exponent = Math.max(0, consecutiveFailures - 1);
    const rawDuration = policy.baseDurationMs * Math.pow(policy.backoffFactor, exponent);
    if (!Number.isFinite(rawDuration) || rawDuration <= 0) {
      return policy.baseDurationMs;
    }
    return Math.min(policy.maxDurationMs, Math.max(policy.baseDurationMs, Math.round(rawDuration)));
  }

  static determineExpiration(
    _source: CooldownSource,
    retryAfterMs?: number,
    consecutiveFailures: number = 1,
    policy: ProviderCooldownPolicy = new ProviderCooldownPolicy(),
    now: number = Date.now()
  ): { durationMs: number; expiresAt: number } {
    const policyDuration = this.calculateBackoffDuration(consecutiveFailures, policy);
    const safeRetryAfter = typeof retryAfterMs === 'number' && Number.isFinite(retryAfterMs) && retryAfterMs > 0
      ? retryAfterMs
      : 0;

    const durationMs = Math.min(policy.maxDurationMs, Math.max(policyDuration, safeRetryAfter));
    return {
      durationMs,
      expiresAt: now + durationMs
    };
  }

  static classifyError(
    err: unknown,
    policy: ProviderCooldownPolicy
  ): { shouldCooldown: boolean; source: CooldownSource; reason: string; retryAfterMs?: number } {
    if (!policy.enabled) {
      return { shouldCooldown: false, source: 'LOCAL_POLICY', reason: 'Cooldown policy disabled' };
    }

    if (err instanceof ProviderRateLimitError) {
      return {
        shouldCooldown: policy.rateLimitTriggersCooldown,
        source: err.retryAfterMs ? 'RETRY_AFTER' : 'PROVIDER_RESPONSE',
        reason: err.message || 'Rate limit exceeded',
        retryAfterMs: err.retryAfterMs
      };
    }

    if (err instanceof ProviderQuotaError) {
      return {
        shouldCooldown: policy.quotaTriggersCooldown,
        source: 'QUOTA_RESET',
        reason: err.message || 'Quota exhausted'
      };
    }

    if (err instanceof ProviderRequestTimeoutError) {
      return {
        shouldCooldown: policy.timeoutTriggersCooldown,
        source: 'LOCAL_POLICY',
        reason: err.message || 'Request timed out'
      };
    }

    if (err instanceof ProviderRequestError) {
      const isRetryable = (err as ProviderRequestError).retryable ?? true;
      if (isRetryable) {
        return {
          shouldCooldown: true,
          source: 'PROVIDER_RESPONSE',
          reason: err.message || 'Retryable provider error'
        };
      }
      return { shouldCooldown: false, source: 'LOCAL_POLICY', reason: 'Non-retryable provider error' };
    }

    return {
      shouldCooldown: policy.unknownErrorTriggersCooldown,
      source: 'LOCAL_POLICY',
      reason: err instanceof Error ? err.message : 'Unknown provider error'
    };
  }
}
