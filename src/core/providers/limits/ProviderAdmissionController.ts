import { ProviderAdmissionPolicy } from './ProviderAdmissionPolicy';
import { ProviderAdmissionState, ProviderAdmissionHealth } from './ProviderAdmissionState';
import { ProviderAdmissionEvaluator } from './ProviderAdmissionEvaluator';
import { AdmissionResult, AdmissionDecision } from './ProviderAdmissionTypes';
import { ProviderRateLimitStateTracker } from './ProviderRateLimitStateTracker';
import { ProviderUsageTracker } from './ProviderUsageTracker';
import { ProviderQuotaPolicy } from './ProviderQuotaPolicy';
import { ProviderCooldownState } from './ProviderCooldownTypes';
import { AIRequest } from '../ai/AIProviderTypes';
import { SearchRequest } from '../search/SearchProviderTypes';
import { IEventBus } from '../../events/IEventBus';
import { EventTopic } from '../../events/EventTypes';

export class ProviderAdmissionController {
  private policy = new ProviderAdmissionPolicy();
  private state: ProviderAdmissionState = {
    status: 'IDLE',
    totalEvaluations: 0,
    totalAllowed: 0,
    totalDenied: 0,
    totalRateLimited: 0,
    totalQuotaExhausted: 0,
    totalCooldown: 0,
    totalCapacityExceeded: 0,
    totalDisabled: 0,
    lastEvaluatedAt: 0
  };

  private providerEnabledMap = new Map<string, boolean>();
  private providerQuotaMap = new Map<string, ProviderQuotaPolicy>();
  private providerCooldownMap = new Map<string, ProviderCooldownState>();
  private decisionsMap = new Map<string, AdmissionResult>();

  constructor(
    private rateLimitTracker: ProviderRateLimitStateTracker,
    private usageTracker: ProviderUsageTracker,
    policyConfig?: ProviderAdmissionPolicy,
    private eventBus?: IEventBus
  ) {
    if (policyConfig) this.policy = policyConfig;
  }

  async initialize(): Promise<void> {
    this.state.status = 'READY';
  }

  setProviderEnabled(providerId: string, enabled: boolean): void {
    this.providerEnabledMap.set(providerId, enabled);
  }

  setProviderQuotaPolicy(providerId: string, policy: ProviderQuotaPolicy): void {
    this.providerQuotaMap.set(providerId, policy);
  }

  setProviderCooldown(providerId: string, cooldown: ProviderCooldownState): void {
    this.providerCooldownMap.set(providerId, cooldown);
  }

  evaluate(request: AIRequest | SearchRequest, providerId: string, activeConcurrentCount: number = 0, maxConcurrentAllowed: number = 10): AdmissionResult {
    this.state.totalEvaluations++;
    this.state.lastEvaluatedAt = Date.now();

    const enabledState = this.providerEnabledMap.get(providerId) ?? true;
    const quotaPolicy = this.providerQuotaMap.get(providerId);
    const cooldownState = this.providerCooldownMap.get(providerId);

    const result = ProviderAdmissionEvaluator.evaluate(
      providerId,
      this.policy,
      this.rateLimitTracker,
      this.usageTracker,
      quotaPolicy,
      cooldownState,
      enabledState,
      activeConcurrentCount,
      maxConcurrentAllowed,
      Date.now()
    );

    if (request.requestId) {
      this.decisionsMap.set(request.requestId, result);
    }

    this.updateCounters(result.decision);
    this.publishAdmissionEvent(result);

    return result;
  }

  canExecute(request: AIRequest | SearchRequest, providerId: string, activeConcurrentCount: number = 0, maxConcurrentAllowed: number = 10): boolean {
    const result = this.evaluate(request, providerId, activeConcurrentCount, maxConcurrentAllowed);
    return result.decision === 'ALLOWED';
  }

  getDecision(requestId: string): AdmissionResult | null {
    return this.decisionsMap.get(requestId) || null;
  }

  getStatus(): ProviderAdmissionState {
    return { ...this.state };
  }

  async healthCheck(): Promise<ProviderAdmissionHealth> {
    const total = this.state.totalEvaluations;
    const denialRate = total > 0 ? parseFloat((this.state.totalDenied / total).toFixed(4)) : 0;
    const status = denialRate >= 0.5 ? 'UNHEALTHY' : denialRate > 0.1 ? 'DEGRADED' : 'HEALTHY';

    return {
      status,
      denialRate,
      lastCheckedAt: Date.now()
    };
  }

  reset(): void {
    this.decisionsMap.clear();
    this.providerCooldownMap.clear();
    this.state.totalEvaluations = 0;
    this.state.totalAllowed = 0;
    this.state.totalDenied = 0;
    this.state.totalRateLimited = 0;
    this.state.totalQuotaExhausted = 0;
    this.state.totalCooldown = 0;
    this.state.totalCapacityExceeded = 0;
    this.state.totalDisabled = 0;
  }

  destroy(): void {
    this.reset();
    this.providerEnabledMap.clear();
    this.providerQuotaMap.clear();
    this.state.status = 'DESTROYED';
  }

  private updateCounters(decision: AdmissionDecision): void {
    if (decision === 'ALLOWED') {
      this.state.totalAllowed++;
    } else {
      this.state.totalDenied++;
      if (decision === 'RATE_LIMITED') this.state.totalRateLimited++;
      if (decision === 'QUOTA_EXHAUSTED') this.state.totalQuotaExhausted++;
      if (decision === 'COOLDOWN') this.state.totalCooldown++;
      if (decision === 'CAPACITY_EXCEEDED') this.state.totalCapacityExceeded++;
      if (decision === 'DISABLED') this.state.totalDisabled++;
    }
  }

  private publishAdmissionEvent(result: AdmissionResult): void {
    if (!this.eventBus) return;

    if (result.decision === 'ALLOWED') {
      this.eventBus.publish('provider.admission_allowed', { providerId: result.providerId, timestamp: Date.now() });
    } else {
      const topicMap: Record<string, EventTopic> = {
        RATE_LIMITED: 'provider.admission_rate_limited',
        QUOTA_EXHAUSTED: 'provider.admission_quota_exhausted',
        COOLDOWN: 'provider.admission_cooldown',
        CAPACITY_EXCEEDED: 'provider.admission_capacity_exceeded',
        DISABLED: 'provider.admission_disabled'
      };

      const topic = topicMap[result.decision] || 'provider.admission_denied';
      this.eventBus.publish(topic, {
        providerId: result.providerId,
        decision: result.decision,
        reason: result.reason,
        retryAt: result.retryAt,
        timestamp: Date.now()
      });
    }
  }
}
