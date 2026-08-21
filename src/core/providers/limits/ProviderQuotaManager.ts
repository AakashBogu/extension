import { ProviderQuotaPolicy } from './ProviderQuotaPolicy';
import { ProviderUsageTracker } from './ProviderUsageTracker';
import { ExtendedQuotaConsumption, ProviderQuotaDecision, ProviderQuotaRemaining, ProviderQuotaReservationHandle } from './ProviderQuotaState';
import { ProviderQuotaState, QuotaAllocation } from './ProviderQuotaTypes';
import { ProviderQuotaEvaluator } from './ProviderQuotaEvaluator';
import { ProviderQuotaSnapshotBuilder } from './ProviderQuotaSnapshotBuilder';
import { ProviderQuotaReservationManager } from './ProviderQuotaReservationManager';
import { AIRequest } from '../ai/AIProviderTypes';
import { SearchRequest } from '../search/SearchProviderTypes';
import { ProviderUsageRecord } from './ProviderUsageTypes';
import { IEventBus } from '../../events/IEventBus';

export class ProviderQuotaManager {
  private policies = new Map<string, ProviderQuotaPolicy>();
  private reservationManager: ProviderQuotaReservationManager;

  constructor(
    private usageTracker: ProviderUsageTracker,
    private eventBus?: IEventBus
  ) {
    this.reservationManager = new ProviderQuotaReservationManager(eventBus);
  }

  async initialize(): Promise<void> {}

  configureQuotaPolicy(providerId: string, policy: ProviderQuotaPolicy): void {
    this.policies.set(providerId, policy);
    this.refresh(providerId);
  }

  getQuotaState(providerId: string, modelId?: string): ProviderQuotaState | null {
    return this.refresh(providerId, modelId);
  }

  refresh(providerId: string, modelId?: string): ProviderQuotaState {
    const policy = this.policies.get(providerId) || new ProviderQuotaPolicy();
    const consumptions: ExtendedQuotaConsumption[] = [];
    const reserved = this.reservationManager.getReservedTotals(providerId, modelId);

    if (policy.enabled) {
      if (policy.dailyLimits) {
        if (policy.dailyLimits.requests) {
          const alloc: QuotaAllocation = { scope: 'PROVIDER', dimension: 'REQUESTS', allocatedLimit: policy.dailyLimits.requests, period: 'DAILY' };
          const snapshot = this.usageTracker.getBucketSnapshot(providerId, 'DAY', undefined, modelId);
          consumptions.push(ProviderQuotaEvaluator.evaluateAllocation(alloc, snapshot, policy, reserved.reservedRequests));
        }
        if (policy.dailyLimits.tokens) {
          const alloc: QuotaAllocation = { scope: 'PROVIDER', dimension: 'TOKENS', allocatedLimit: policy.dailyLimits.tokens, period: 'DAILY' };
          const snapshot = this.usageTracker.getBucketSnapshot(providerId, 'DAY', undefined, modelId);
          consumptions.push(ProviderQuotaEvaluator.evaluateAllocation(alloc, snapshot, policy, reserved.reservedTokens));
        }
        if (policy.dailyLimits.cost) {
          const alloc: QuotaAllocation = { scope: 'PROVIDER', dimension: 'COST', allocatedLimit: policy.dailyLimits.cost, period: 'DAILY' };
          const snapshot = this.usageTracker.getBucketSnapshot(providerId, 'DAY', undefined, modelId);
          consumptions.push(ProviderQuotaEvaluator.evaluateAllocation(alloc, snapshot, policy, reserved.reservedCost));
        }
      }

      if (policy.monthlyLimits) {
        if (policy.monthlyLimits.requests) {
          const alloc: QuotaAllocation = { scope: 'PROVIDER', dimension: 'REQUESTS', allocatedLimit: policy.monthlyLimits.requests, period: 'MONTHLY' };
          const snapshot = this.usageTracker.getBucketSnapshot(providerId, 'MONTH', undefined, modelId);
          consumptions.push(ProviderQuotaEvaluator.evaluateAllocation(alloc, snapshot, policy, reserved.reservedRequests));
        }
        if (policy.monthlyLimits.tokens) {
          const alloc: QuotaAllocation = { scope: 'PROVIDER', dimension: 'TOKENS', allocatedLimit: policy.monthlyLimits.tokens, period: 'MONTHLY' };
          const snapshot = this.usageTracker.getBucketSnapshot(providerId, 'MONTH', undefined, modelId);
          consumptions.push(ProviderQuotaEvaluator.evaluateAllocation(alloc, snapshot, policy, reserved.reservedTokens));
        }
        if (policy.monthlyLimits.cost) {
          const alloc: QuotaAllocation = { scope: 'PROVIDER', dimension: 'COST', allocatedLimit: policy.monthlyLimits.cost, period: 'MONTHLY' };
          const snapshot = this.usageTracker.getBucketSnapshot(providerId, 'MONTH', undefined, modelId);
          consumptions.push(ProviderQuotaEvaluator.evaluateAllocation(alloc, snapshot, policy, reserved.reservedCost));
        }
      }
    }

    const snapshot = ProviderQuotaSnapshotBuilder.buildSnapshot(providerId, consumptions);

    if (this.eventBus) {
      const exhausted = consumptions.some(c => c.isExhausted);
      const warning = consumptions.some(c => c.level === 'WARNING');
      const critical = consumptions.some(c => c.level === 'CRITICAL');

      this.eventBus.publish('provider.quota_updated', { providerId, modelId, isExhausted: exhausted, timestamp: Date.now() });

      if (exhausted) {
        this.eventBus.publish('provider.quota_exhausted', { providerId, modelId, timestamp: Date.now() });
      } else if (critical) {
        this.eventBus.publish('provider.quota_critical', { providerId, modelId, timestamp: Date.now() });
      } else if (warning) {
        this.eventBus.publish('provider.quota_warning', { providerId, modelId, timestamp: Date.now() });
      }
    }

    return snapshot;
  }

  evaluate(_providerId: string, _request: AIRequest | SearchRequest, modelId?: string): ProviderQuotaDecision {
    const providerId = _providerId;
    const state = this.refresh(providerId, modelId);
    const exhaustedQuota = state.quotas.find(q => (q as ExtendedQuotaConsumption).isExhausted);

    if (exhaustedQuota) {
      const ext = exhaustedQuota as ExtendedQuotaConsumption;
      return {
        decision: 'QUOTA_EXHAUSTED',
        providerId,
        reason: `Quota [${ext.allocation.dimension}/${ext.allocation.period}] exhausted for provider [${providerId}]`,
        remainingAmount: 0,
        resetTimestamp: ext.resetTimestamp
      };
    }

    const warningQuota = state.quotas.find(q => (q as ExtendedQuotaConsumption).level === 'WARNING' || (q as ExtendedQuotaConsumption).level === 'CRITICAL');
    const minRemaining = Math.min(...state.quotas.map(q => (q as ExtendedQuotaConsumption).remainingAmount), Infinity);

    return {
      decision: warningQuota ? 'QUOTA_WARNING' : 'ALLOWED',
      providerId,
      reason: warningQuota ? `Quota warning threshold reached for provider [${providerId}]` : `Quota available for provider [${providerId}]`,
      remainingAmount: Number.isFinite(minRemaining) ? minRemaining : 999999,
      resetTimestamp: state.quotas[0]?.resetTimestamp || Date.now() + 86400000
    };
  }

  isExhausted(providerId: string, modelId?: string): boolean {
    const state = this.refresh(providerId, modelId);
    return state.quotas.some(q => (q as ExtendedQuotaConsumption).isExhausted);
  }

  getRemaining(providerId: string, modelId?: string): ProviderQuotaRemaining {
    const state = this.refresh(providerId, modelId);
    let reqRem = Infinity;
    let tokRem = Infinity;
    let costRem = Infinity;

    state.quotas.forEach(q => {
      const ext = q as ExtendedQuotaConsumption;
      if (ext.allocation.dimension === 'REQUESTS') reqRem = Math.min(reqRem, ext.remainingAmount);
      if (ext.allocation.dimension === 'TOKENS') tokRem = Math.min(tokRem, ext.remainingAmount);
      if (ext.allocation.dimension === 'COST') costRem = Math.min(costRem, ext.remainingAmount);
    });

    return {
      requestsRemaining: Number.isFinite(reqRem) ? reqRem : 999999,
      tokensRemaining: Number.isFinite(tokRem) ? tokRem : 999999,
      costRemaining: Number.isFinite(costRem) ? costRem : 999999
    };
  }

  reserve(
    providerId: string,
    estimatedRequests: number = 1,
    estimatedTokens: number = 0,
    estimatedCost: number = 0,
    modelId?: string
  ): ProviderQuotaReservationHandle {
    return this.reservationManager.reserve(providerId, modelId, estimatedRequests, estimatedTokens, estimatedCost);
  }

  release(reservationId: string): boolean {
    return this.reservationManager.release(reservationId);
  }

  commit(reservationId: string, usage: ProviderUsageRecord): boolean {
    return this.reservationManager.commit(reservationId, usage);
  }

  reset(providerId?: string): void {
    if (providerId) {
      this.usageTracker.resetProvider(providerId);
      this.refresh(providerId);
    } else {
      this.usageTracker.resetAll();
      this.reservationManager.reset();
      this.policies.clear();
    }

    if (this.eventBus) {
      this.eventBus.publish('provider.quota_reset', { providerId: providerId || '*', timestamp: Date.now() });
    }
  }

  getAllStates(): ProviderQuotaState[] {
    const states: ProviderQuotaState[] = [];
    this.policies.forEach((_, providerId) => {
      states.push(this.refresh(providerId));
    });
    return states;
  }

  async shutdown(): Promise<void> {
    this.destroy();
  }

  destroy(): void {
    this.reservationManager.reset();
    this.policies.clear();
  }
}
