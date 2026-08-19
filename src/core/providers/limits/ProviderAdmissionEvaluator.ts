import { AdmissionResult } from './ProviderAdmissionTypes';
import { ProviderAdmissionPolicy } from './ProviderAdmissionPolicy';
import { ProviderRateLimitStateTracker } from './ProviderRateLimitStateTracker';
import { ProviderUsageTracker } from './ProviderUsageTracker';
import { ProviderQuotaPolicy } from './ProviderQuotaPolicy';
import { ProviderCooldownState } from './ProviderCooldownTypes';
import { ExtendedRateLimitState } from './ProviderRateLimitStateTypes';

export class ProviderAdmissionEvaluator {
  static evaluate(
    providerId: string,
    policy: ProviderAdmissionPolicy,
    rateLimitTracker: ProviderRateLimitStateTracker,
    usageTracker: ProviderUsageTracker,
    quotaPolicy?: ProviderQuotaPolicy,
    cooldownState?: ProviderCooldownState,
    enabledState: boolean = true,
    activeConcurrentCount: number = 0,
    maxConcurrentAllowed: number = 10,
    now: number = Date.now()
  ): AdmissionResult {
    // 1. DISABLED check
    if (!enabledState) {
      return {
        providerId,
        decision: 'DISABLED',
        reason: `Provider [${providerId}] is disabled`,
        checkedAt: now
      };
    }

    // 2. COOLDOWN check
    if (policy.enforceCooldown && cooldownState && cooldownState.inCooldown && cooldownState.expiresAt && now < cooldownState.expiresAt) {
      return {
        providerId,
        decision: 'COOLDOWN',
        reason: `Provider [${providerId}] is in active cooldown (${cooldownState.reason})`,
        checkedAt: now,
        retryAt: cooldownState.expiresAt,
        remainingCapacity: 0
      };
    }

    // 3. QUOTA_EXHAUSTED check
    if (policy.enforceQuota && quotaPolicy && quotaPolicy.enabled) {
      const daySnapshot = usageTracker.getBucketSnapshot(providerId, 'DAY');
      if (daySnapshot && quotaPolicy.dailyLimits) {
        const m = daySnapshot.metrics;
        if (quotaPolicy.dailyLimits.requests && m.successfulRequests + m.failedRequests >= quotaPolicy.dailyLimits.requests) {
          return {
            providerId,
            decision: 'QUOTA_EXHAUSTED',
            reason: `Daily request quota exhausted for provider [${providerId}]`,
            checkedAt: now,
            remainingCapacity: 0
          };
        }
        if (quotaPolicy.dailyLimits.tokens && m.totalTokens >= quotaPolicy.dailyLimits.tokens) {
          return {
            providerId,
            decision: 'QUOTA_EXHAUSTED',
            reason: `Daily token quota exhausted for provider [${providerId}]`,
            checkedAt: now,
            remainingCapacity: 0
          };
        }
      }
    }

    // 4. RATE_LIMITED check
    if (policy.enforceRateLimit) {
      const snapshot = rateLimitTracker.refreshProvider(providerId);
      if (snapshot && snapshot.limits.length > 0) {
        const exhausted = snapshot.limits.find(l => (l as ExtendedRateLimitState).isExhausted);
        if (exhausted) {
          const ext = exhausted as ExtendedRateLimitState;
          return {
            providerId,
            decision: 'RATE_LIMITED',
            reason: `Rate limit [${ext.definition.dimension}/${ext.definition.window}] exhausted for provider [${providerId}]`,
            checkedAt: now,
            retryAt: ext.resetTimestamp,
            remainingCapacity: 0
          };
        }
      }
    }

    // 5. CAPACITY_EXCEEDED check
    if (policy.enforceCapacity && activeConcurrentCount >= maxConcurrentAllowed) {
      return {
        providerId,
        decision: 'CAPACITY_EXCEEDED',
        reason: `Concurrent capacity limit (${maxConcurrentAllowed}) reached for provider [${providerId}]`,
        checkedAt: now,
        remainingCapacity: 0
      };
    }

    // 6. ALLOWED
    return {
      providerId,
      decision: 'ALLOWED',
      reason: `Provider [${providerId}] admitted`,
      checkedAt: now,
      remainingCapacity: Math.max(0, maxConcurrentAllowed - activeConcurrentCount)
    };
  }
}
