import { ProviderHealthStatus } from '../ProviderTypes';
import { ProviderLatencyTracker } from './ProviderLatencyTracker';
import { ProviderReliabilityTracker } from './ProviderReliabilityTracker';
import { ProviderHealthScoringPolicy } from './ProviderHealthScoringPolicy';
import { ProviderHealthEvaluator } from './ProviderHealthEvaluator';
import { ProviderHealthScore, ProviderRoutingScore, ProviderReliabilityMetrics } from './ProviderHealthTypes';
import { IEventBus } from '../../events/IEventBus';

export interface ProviderHealthRecord {
  providerId: string;
  status: ProviderHealthStatus;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastCheckedAt: number;
  latencyMs?: number;
  lastError?: string;
}

export class ProviderHealthManager {
  private latencyTracker = new ProviderLatencyTracker();
  private reliabilityTracker = new ProviderReliabilityTracker(this.latencyTracker);
  private scoringPolicy = new ProviderHealthScoringPolicy();

  constructor(private eventBus?: IEventBus, policyConfig?: ProviderHealthScoringPolicy) {
    if (policyConfig) this.scoringPolicy = policyConfig;
  }

  getHealth(providerId: string): ProviderHealthStatus {
    const metrics = this.reliabilityTracker.getMetrics(providerId);
    if (metrics.consecutiveFailures >= 3) return 'UNHEALTHY';
    if (metrics.consecutiveFailures > 0) return 'DEGRADED';
    return 'HEALTHY';
  }

  getHealthRecord(providerId: string): ProviderHealthRecord | undefined {
    const metrics = this.reliabilityTracker.getMetrics(providerId);
    if (metrics.totalRequests === 0) return undefined;
    return {
      providerId,
      status: this.getHealth(providerId),
      consecutiveFailures: metrics.consecutiveFailures,
      consecutiveSuccesses: metrics.consecutiveSuccesses,
      lastCheckedAt: metrics.lastSuccessAt || metrics.lastFailureAt || Date.now(),
      latencyMs: metrics.averageLatencyMs
    };
  }

  recordSuccess(providerId: string, latencyMs: number): void {
    const oldStatus = this.getHealth(providerId);
    this.reliabilityTracker.recordOutcome(providerId, 'SUCCESS', latencyMs);
    const newStatus = this.getHealth(providerId);

    if (this.eventBus) {
      this.eventBus.publish('provider.health_changed', { providerId, status: newStatus, timestamp: Date.now() });
      if (oldStatus !== newStatus) {
        if (newStatus === 'HEALTHY' && oldStatus !== 'HEALTHY') {
          this.eventBus.publish('provider.health_recovered', { providerId, status: newStatus, timestamp: Date.now() });
        }
      }
    }
  }

  recordFailure(providerId: string, error: string, retryable: boolean = true): void {
    const oldStatus = this.getHealth(providerId);
    const outcome = retryable ? 'RETRYABLE_FAILURE' : 'NON_RETRYABLE_FAILURE';
    this.reliabilityTracker.recordOutcome(providerId, outcome);
    const newStatus = this.getHealth(providerId);

    if (this.eventBus) {
      this.eventBus.publish('provider.health_changed', { providerId, status: newStatus, error, timestamp: Date.now() });
      if (newStatus === 'DEGRADED' && oldStatus === 'HEALTHY') {
        this.eventBus.publish('provider.health_degraded', { providerId, status: newStatus, error, timestamp: Date.now() });
      } else if (newStatus === 'UNHEALTHY' && oldStatus !== 'UNHEALTHY') {
        this.eventBus.publish('provider.health_unhealthy', { providerId, status: newStatus, error, timestamp: Date.now() });
      }
    }
  }

  getMetrics(providerId: string): ProviderReliabilityMetrics {
    return this.reliabilityTracker.getMetrics(providerId);
  }

  getHealthScore(
    providerId: string,
    inCooldown: boolean = false,
    isRateLimited: boolean = false,
    isQuotaExhausted: boolean = false
  ): ProviderHealthScore {
    const metrics = this.reliabilityTracker.getMetrics(providerId);
    const score = ProviderHealthEvaluator.evaluateHealthScore(
      providerId,
      metrics,
      this.scoringPolicy,
      inCooldown,
      isRateLimited,
      isQuotaExhausted
    );

    if (this.eventBus) {
      this.eventBus.publish('provider.health_updated', {
        providerId,
        healthState: score.healthState,
        healthScore: score.healthScore,
        timestamp: Date.now()
      });
    }

    return score;
  }

  getRoutingScore(
    providerId: string,
    priority: number,
    inCooldown: boolean = false,
    isQuotaExhausted: boolean = false,
    isRateLimited: boolean = false,
    enabled: boolean = true
  ): ProviderRoutingScore {
    const healthScoreObj = this.getHealthScore(providerId, inCooldown, isRateLimited, isQuotaExhausted);
    const score = ProviderHealthEvaluator.evaluateRoutingScore(
      providerId,
      healthScoreObj,
      priority,
      inCooldown,
      isQuotaExhausted,
      isRateLimited,
      enabled
    );

    if (this.eventBus) {
      this.eventBus.publish('provider.routing_score_updated', {
        providerId,
        routingScore: score.routingScore,
        isEligible: score.isEligible,
        timestamp: Date.now()
      });
    }

    return score;
  }

  rankProviders<T extends { id: string; priority: number; enabled?: boolean }>(
    providers: T[],
    cooldownManager?: { isInCooldown: (id: string) => boolean },
    quotaManager?: { isExhausted: (id: string) => boolean },
    rateLimitTracker?: { isExhausted?: (id: string) => boolean }
  ): Array<{ provider: T; score: ProviderRoutingScore }> {
    const scored = providers.map(provider => {
      const inCooldown = cooldownManager ? cooldownManager.isInCooldown(provider.id) : false;
      const isQuotaExhausted = quotaManager ? quotaManager.isExhausted(provider.id) : false;
      const isRateLimited = rateLimitTracker && rateLimitTracker.isExhausted ? rateLimitTracker.isExhausted(provider.id) : false;
      const enabled = provider.enabled ?? true;

      const score = this.getRoutingScore(provider.id, provider.priority, inCooldown, isQuotaExhausted, isRateLimited, enabled);
      return { provider, score };
    });

    // Deterministic ranking order:
    // 1. Eligible first (isEligible desc)
    // 2. Routing Score desc
    // 3. Priority desc
    // 4. Health Score desc
    // 5. Average Latency asc
    // 6. Provider ID lexical asc
    return scored.sort((a, b) => {
      if (a.score.isEligible !== b.score.isEligible) {
        return a.score.isEligible ? -1 : 1;
      }
      if (a.score.routingScore !== b.score.routingScore) {
        return b.score.routingScore - a.score.routingScore;
      }
      if (a.provider.priority !== b.provider.priority) {
        return b.provider.priority - a.provider.priority;
      }
      if (a.score.healthScore !== b.score.healthScore) {
        return b.score.healthScore - a.score.healthScore;
      }
      const latA = this.latencyTracker.getAverageLatency(a.provider.id);
      const latB = this.latencyTracker.getAverageLatency(b.provider.id);
      if (latA !== latB) {
        return latA - latB;
      }
      return a.provider.id.localeCompare(b.provider.id);
    });
  }

  clear(providerId?: string): void {
    this.reliabilityTracker.reset(providerId);
  }
}
