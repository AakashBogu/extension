import { ProviderHealthScoringPolicy } from './ProviderHealthScoringPolicy';
import { ProviderReliabilityMetrics, ProviderHealthScore, ProviderRoutingScore, ExtendedProviderHealthState } from './ProviderHealthTypes';

export class ProviderHealthEvaluator {
  static evaluateHealthScore(
    providerId: string,
    metrics: ProviderReliabilityMetrics,
    policy: ProviderHealthScoringPolicy,
    inCooldown: boolean = false,
    isRateLimited: boolean = false,
    isQuotaExhausted: boolean = false,
    now: number = Date.now()
  ): ProviderHealthScore {
    // 1. Reliability Sub-Score
    let reliabilitySubScore = metrics.successRate;
    if (metrics.consecutiveFailures > 0) {
      const penalty = Math.min(0.5, metrics.consecutiveFailures * 0.15);
      reliabilitySubScore = Math.max(0.0, reliabilitySubScore - penalty);
    }

    // 2. Latency Sub-Score
    let latencySubScore = 1.0;
    if (metrics.averageLatencyMs > 0) {
      const ratio = metrics.averageLatencyMs / policy.targetLatencyMs;
      latencySubScore = parseFloat(Math.max(0.0, Math.min(1.0, 1.0 - (ratio - 1.0) * 0.5)).toFixed(4));
    }

    // 3. Pressure Sub-Scores
    const rateLimitSubScore = isRateLimited ? 0.0 : 1.0;
    const quotaSubScore = isQuotaExhausted ? 0.0 : 1.0;
    const cooldownSubScore = inCooldown ? 0.0 : 1.0;

    // 4. Weighted Health Score
    const totalWeight = policy.reliabilityWeight + policy.latencyWeight + policy.rateLimitWeight + policy.quotaWeight + policy.cooldownWeight;
    const rawScore =
      reliabilitySubScore * policy.reliabilityWeight +
      latencySubScore * policy.latencyWeight +
      rateLimitSubScore * policy.rateLimitWeight +
      quotaSubScore * policy.quotaWeight +
      cooldownSubScore * policy.cooldownWeight;

    const healthScore = parseFloat((rawScore / totalWeight).toFixed(4));

    // 5. State Classification
    let healthState: ExtendedProviderHealthState = 'HEALTHY';
    if (inCooldown || metrics.consecutiveFailures >= 3 || healthScore < policy.unhealthyThreshold) {
      healthState = 'UNHEALTHY';
    } else if (healthScore < policy.degradedThreshold || metrics.consecutiveFailures > 0 || isRateLimited || isQuotaExhausted) {
      healthState = 'DEGRADED';
    }

    return {
      providerId,
      healthState,
      healthScore,
      reliabilitySubScore,
      latencySubScore,
      rateLimitSubScore,
      quotaSubScore,
      cooldownSubScore,
      updatedAt: now
    };
  }

  static evaluateRoutingScore(
    providerId: string,
    healthScoreObj: ProviderHealthScore,
    priority: number,
    inCooldown: boolean = false,
    isQuotaExhausted: boolean = false,
    isRateLimited: boolean = false,
    enabled: boolean = true,
    now: number = Date.now()
  ): ProviderRoutingScore {
    let isEligible = true;
    let ineligibilityReason: string | undefined = undefined;

    if (!enabled) {
      isEligible = false;
      ineligibilityReason = `Provider [${providerId}] is disabled`;
    } else if (inCooldown) {
      isEligible = false;
      ineligibilityReason = `Provider [${providerId}] is in active cooldown`;
    } else if (isQuotaExhausted) {
      isEligible = false;
      ineligibilityReason = `Provider [${providerId}] has exhausted its quota`;
    } else if (isRateLimited) {
      isEligible = false;
      ineligibilityReason = `Provider [${providerId}] is rate-limited`;
    } else if (healthScoreObj.healthState === 'UNHEALTHY') {
      isEligible = false;
      ineligibilityReason = `Provider [${providerId}] is UNHEALTHY`;
    }

    if (!isEligible) {
      return {
        providerId,
        routingScore: 0.0,
        healthScore: healthScoreObj.healthScore,
        priority,
        isEligible: false,
        inCooldown,
        isQuotaExhausted,
        isRateLimited,
        ineligibilityReason,
        calculatedAt: now
      };
    }

    // Normalized routing score combination: 70% health, 30% priority (clamped to 100 max)
    const normPriority = Math.min(1.0, Math.max(0.0, priority / 100));
    const routingScore = parseFloat(((healthScoreObj.healthScore * 0.70) + (normPriority * 0.30)).toFixed(4));

    return {
      providerId,
      routingScore,
      healthScore: healthScoreObj.healthScore,
      priority,
      isEligible: true,
      inCooldown: false,
      isQuotaExhausted: false,
      isRateLimited: false,
      calculatedAt: now
    };
  }
}
