import { QuotaAllocation } from './ProviderQuotaTypes';
import { ProviderQuotaPolicy } from './ProviderQuotaPolicy';
import { ProviderUsageSnapshot } from './ProviderUsageTrackerTypes';
import { ExtendedQuotaConsumption, QuotaUtilizationLevel } from './ProviderQuotaState';

export class ProviderQuotaEvaluator {
  static evaluateAllocation(
    allocation: QuotaAllocation,
    snapshot: ProviderUsageSnapshot | null,
    policy: ProviderQuotaPolicy,
    reservedAmount: number = 0,
    now: number = Date.now()
  ): ExtendedQuotaConsumption {
    let durationMs = 86400000; // DAY default
    if (allocation.period === 'MONTHLY') durationMs = 2592000000;
    if (allocation.period === 'CUSTOM') durationMs = allocation.customPeriodMs || 86400000;

    const windowStart = Math.floor(now / durationMs) * durationMs;
    const windowEnd = windowStart + durationMs;

    let consumedFromUsage = 0;
    if (snapshot) {
      const m = snapshot.metrics;
      if (allocation.dimension === 'REQUESTS') {
        consumedFromUsage = m.successfulRequests + m.failedRequests;
      } else if (allocation.dimension === 'TOKENS') {
        consumedFromUsage = m.totalTokens;
      } else if (allocation.dimension === 'COST') {
        consumedFromUsage = m.estimatedCost;
      }
    }

    const consumedAmount = consumedFromUsage + reservedAmount;
    const limit = allocation.allocatedLimit;
    const remainingAmount = Math.max(0, limit - consumedAmount);
    const rawRatio = limit > 0 ? consumedAmount / limit : 0;
    const utilizationRatio = parseFloat(Math.min(1.0, rawRatio).toFixed(4));
    const isExhausted = consumedAmount >= limit;

    let level: QuotaUtilizationLevel = 'NORMAL';
    if (isExhausted) {
      level = 'EXHAUSTED';
    } else if (utilizationRatio >= 0.9) {
      level = 'CRITICAL';
    } else if (utilizationRatio >= policy.warningThresholdRatio) {
      level = 'WARNING';
    }

    return {
      allocation,
      consumedAmount,
      remainingAmount,
      resetTimestamp: windowEnd,
      isExhausted,
      utilizationRatio,
      level,
      isLimiting: false,
      windowStart,
      windowEnd
    };
  }
}
