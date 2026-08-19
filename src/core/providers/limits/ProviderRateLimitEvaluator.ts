import { RateLimitDefinition } from './ProviderRateLimitTypes';
import { ExtendedRateLimitState, UtilizationLevel } from './ProviderRateLimitStateTypes';
import { ProviderRateLimitWindowManager } from './ProviderRateLimitWindowManager';
import { ProviderUsageSnapshot } from './ProviderUsageTrackerTypes';

export class ProviderRateLimitEvaluator {
  static evaluate(
    definition: RateLimitDefinition,
    snapshot: ProviderUsageSnapshot,
    now: number = Date.now(),
    warningThresholdRatio: number = 0.8
  ): ExtendedRateLimitState {
    const bounds = ProviderRateLimitWindowManager.getWindowBounds(definition.window, now, definition.customWindowMs);

    let currentUsage = 0;
    const m = snapshot.metrics;

    switch (definition.dimension) {
      case 'REQUESTS':
        currentUsage = m.successfulRequests + m.failedRequests;
        break;
      case 'TOKENS':
        currentUsage = m.totalTokens;
        break;
      case 'CONCURRENT_REQUESTS':
        currentUsage = m.currentConcurrentRequests;
        break;
      case 'COST':
        currentUsage = m.estimatedCost;
        break;
    }

    const remainingCapacity = Math.max(0, definition.limit - currentUsage);
    const rawRatio = definition.limit > 0 ? currentUsage / definition.limit : 0;
    const utilizationRatio = parseFloat(Math.min(1.0, rawRatio).toFixed(4));
    const isExhausted = currentUsage >= definition.limit;

    let level: UtilizationLevel = 'NORMAL';
    if (isExhausted) {
      level = 'EXHAUSTED';
    } else if (utilizationRatio >= 0.9) {
      level = 'CRITICAL';
    } else if (utilizationRatio >= warningThresholdRatio) {
      level = 'WARNING';
    }

    return {
      definition,
      currentUsage,
      remainingCapacity,
      resetTimestamp: bounds.resetTimestamp,
      utilizationRatio,
      isExhausted,
      level,
      isLimiting: false,
      windowStart: bounds.windowStart,
      windowEnd: bounds.windowEnd
    };
  }
}
