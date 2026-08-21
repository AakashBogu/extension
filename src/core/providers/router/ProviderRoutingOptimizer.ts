import { ProviderAdaptiveRoutingPolicy } from './ProviderAdaptiveRoutingPolicy';
import { ProviderRoutingOutcomeTracker } from './ProviderRoutingOutcomeTracker';
import { ProviderRoutingDecision } from './ProviderRoutingDecision';
import { ProviderRoutingScore } from '../health/ProviderHealthTypes';
import { IEventBus } from '../../events/IEventBus';

export interface EligibleCandidateScore {
  isEligible: boolean;
  routingScore: number;
  healthScore?: number;
  inCooldown?: boolean;
  isQuotaExhausted?: boolean;
  isRateLimited?: boolean;
  ineligibilityReason?: string;
}

export class ProviderRoutingOptimizer {
  public outcomeTracker: ProviderRoutingOutcomeTracker;

  constructor(
    outcomeTracker?: ProviderRoutingOutcomeTracker,
    private eventBus?: IEventBus
  ) {
    this.outcomeTracker = outcomeTracker || new ProviderRoutingOutcomeTracker(200, eventBus);
  }

  optimizeCandidates<T extends { id: string; priority: number; enabled?: boolean }>(
    candidates: Array<{ provider: T; score: EligibleCandidateScore | ProviderRoutingScore }>,
    requestType: 'AI' | 'SEARCH',
    policyConfig?: ProviderAdaptiveRoutingPolicy
  ): Array<{ provider: T; decision: ProviderRoutingDecision }> {
    try {
      const policy = policyConfig || new ProviderAdaptiveRoutingPolicy({ requestType });
      const lastSelectedId = this.outcomeTracker ? this.outcomeTracker.getLastSelected(requestType) : undefined;

      const optimized = candidates.map(entry => {
        const { provider, score } = entry;
        const now = Date.now();

        if (!score.isEligible) {
          const decision: ProviderRoutingDecision = {
            providerId: provider.id,
            requestType,
            routingScore: 0.0,
            healthScore: score.healthScore || 0,
            priority: provider.priority,
            latencyScore: 1.0,
            reliabilityScore: 1.0,
            quotaScore: score.isQuotaExhausted ? 0.0 : 1.0,
            rateLimitScore: score.isRateLimited ? 0.0 : 1.0,
            cooldownPenalty: score.inCooldown ? 1.0 : 0.0,
            explorationBonus: 0.0,
            adaptiveAdjustment: 0.0,
            stickinessBonus: 0.0,
            finalScore: 0.0,
            decisionReason: score.ineligibilityReason || `Provider [${provider.id}] is ineligible`,
            timestamp: now
          };
          return { provider, decision };
        }

        // Compute adaptive adjustment and exploration bonus
        const { adaptiveAdjustment, explorationBonus } = this.outcomeTracker ? this.outcomeTracker.getAdaptiveAdjustment(
          provider.id,
          requestType,
          policy
        ) : { adaptiveAdjustment: 0, explorationBonus: 0 };

        // Stickiness bonus for recently selected provider
        const stickinessBonus = lastSelectedId === provider.id ? policy.stickinessBonus : 0.0;

        // Base 6F.7 score + adjustments
        const rawFinal = score.routingScore + adaptiveAdjustment + explorationBonus + stickinessBonus;
        const finalScore = parseFloat(Math.max(0.0, Math.min(1.0, rawFinal)).toFixed(4));

        let reason = `Admitted with base routing score (${score.routingScore})`;
        if (explorationBonus > 0) reason += `, includes exploration bonus (+${explorationBonus})`;
        if (stickinessBonus > 0) reason += `, includes stickiness bonus (+${stickinessBonus})`;

        const decision: ProviderRoutingDecision = {
          providerId: provider.id,
          requestType,
          routingScore: score.routingScore,
          healthScore: score.healthScore || 1.0,
          priority: provider.priority,
          latencyScore: 1.0,
          reliabilityScore: 1.0,
          quotaScore: 1.0,
          rateLimitScore: 1.0,
          cooldownPenalty: 0.0,
          explorationBonus,
          adaptiveAdjustment,
          stickinessBonus,
          finalScore,
          decisionReason: reason,
          timestamp: now
        };

        return { provider, decision };
      });

      // Sort candidate decisions deterministically:
      // 1. Eligible first (finalScore > 0)
      // 2. Final score desc with hysteresis / delta check
      // 3. Priority desc
      // 4. Provider ID lexical asc
      const sorted = optimized.sort((a, b) => {
        if ((a.decision.finalScore > 0) !== (b.decision.finalScore > 0)) {
          return a.decision.finalScore > 0 ? -1 : 1;
        }

        const scoreDiff = Math.abs(b.decision.finalScore - a.decision.finalScore);
        if (scoreDiff >= policy.minimumScoreDelta) {
          return b.decision.finalScore - a.decision.finalScore;
        }

        const priorityDiff = b.provider.priority - a.provider.priority;
        if (priorityDiff !== 0) return priorityDiff;

        return a.provider.id.localeCompare(b.provider.id);
      });

      if (this.eventBus && sorted.length > 0 && sorted[0].decision.finalScore > 0) {
        this.eventBus.publish('provider.routing_optimized', {
          providerId: sorted[0].provider.id,
          requestType,
          finalScore: sorted[0].decision.finalScore,
          timestamp: Date.now()
        });
      }

      return sorted;
    } catch (err) {
      // Fail-Safe Fallback: return unoptimized 6F.7 ranking without throwing!
      return candidates.map(c => ({
        provider: c.provider,
        decision: {
          providerId: c.provider.id,
          requestType,
          routingScore: c.score.routingScore,
          healthScore: c.score.healthScore || 0,
          priority: c.provider.priority,
          latencyScore: 1.0,
          reliabilityScore: 1.0,
          quotaScore: 1.0,
          rateLimitScore: 1.0,
          cooldownPenalty: 0.0,
          explorationBonus: 0.0,
          adaptiveAdjustment: 0.0,
          stickinessBonus: 0.0,
          finalScore: c.score.routingScore,
          decisionReason: 'Fail-safe fallback to baseline 6F.7 routing',
          timestamp: Date.now()
        }
      }));
    }
  }
}
