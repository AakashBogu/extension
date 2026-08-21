import { ProviderAdmissionPolicy } from './ProviderAdmissionPolicy';
import { ProviderRateLimitStateTracker } from './ProviderRateLimitStateTracker';
import { ProviderUsageTracker } from './ProviderUsageTracker';
import { ProviderCooldownManager } from './ProviderCooldownManager';
import { ProviderQuotaManager } from './ProviderQuotaManager';
import { ProviderQuotaPolicy } from './ProviderQuotaPolicy';
import { ProviderCooldownState } from './ProviderCooldownTypes';
import { ProviderReliabilityRecoveryManager } from '../recovery/ProviderReliabilityRecoveryManager';
import { AdmissionResult } from './ProviderAdmissionTypes';
import { ProviderAdmissionEvaluator } from './ProviderAdmissionEvaluator';
import { AIRequest } from '../ai/AIProviderTypes';
import { SearchRequest } from '../search/SearchProviderTypes';
import { IEventBus } from '../../events/IEventBus';

export class ProviderAdmissionController {
  public readonly policy: ProviderAdmissionPolicy;
  private disabledProviders = new Set<string>();
  private manualCooldowns = new Map<string, ProviderCooldownState>();
  private manualQuotaPolicies = new Map<string, ProviderQuotaPolicy>();
  private totalEvaluations = 0;
  private totalAllowed = 0;
  private totalDenied = 0;

  constructor(
    public readonly rateLimitTracker: ProviderRateLimitStateTracker,
    public readonly usageTracker: ProviderUsageTracker,
    policyConfig?: ProviderAdmissionPolicy,
    public readonly cooldownManager?: ProviderCooldownManager,
    public readonly quotaManager?: ProviderQuotaManager,
    public readonly recoveryManager?: ProviderReliabilityRecoveryManager,
    private eventBus?: IEventBus
  ) {
    this.policy = policyConfig || new ProviderAdmissionPolicy();
  }

  async initialize(): Promise<void> {}

  evaluate(
    request: AIRequest | SearchRequest,
    providerId: string,
    activeConcurrentCount: number = 0,
    maxConcurrentAllowed: number = 10,
    isProbe: boolean = false
  ): AdmissionResult {
    this.totalEvaluations++;
    const managerCooldown = this.cooldownManager ? (this.cooldownManager.getCooldown(providerId) || undefined) : undefined;
    const cooldownState = this.manualCooldowns.get(providerId) || managerCooldown;
    const quotaPolicy = this.manualQuotaPolicies.get(providerId);
    const isEnabled = !this.disabledProviders.has(providerId);

    const result = ProviderAdmissionEvaluator.evaluate(
      providerId,
      this.policy,
      this.rateLimitTracker,
      this.usageTracker,
      quotaPolicy,
      cooldownState,
      isEnabled,
      activeConcurrentCount,
      maxConcurrentAllowed,
      this.quotaManager,
      request,
      this.recoveryManager,
      isProbe
    );

    if (result.decision === 'ALLOWED') {
      this.totalAllowed++;
      if (this.eventBus) this.eventBus.publish('provider.admission_allowed', result);
    } else {
      this.totalDenied++;
      if (this.eventBus) this.eventBus.publish('provider.admission_denied', result);
    }

    return result;
  }

  canExecute(request: AIRequest | SearchRequest, providerId: string): boolean {
    return this.evaluate(request, providerId).decision === 'ALLOWED';
  }

  getStatus() {
    return {
      totalEvaluations: this.totalEvaluations,
      totalAllowed: this.totalAllowed,
      totalDenied: this.totalDenied
    };
  }

  setProviderEnabled(providerId: string, enabled: boolean): void {
    if (enabled) {
      this.disabledProviders.delete(providerId);
    } else {
      this.disabledProviders.add(providerId);
    }
  }

  setProviderCooldown(providerId: string, durationOrConfig: number | { providerId: string; inCooldown: boolean; reason?: string; expiresAt?: number }, reason: string = 'Manual cooldown'): void {
    if (typeof durationOrConfig === 'number') {
      const state: ProviderCooldownState = {
        providerId,
        inCooldown: true,
        reason,
        expiresAt: Date.now() + durationOrConfig
      };
      this.manualCooldowns.set(providerId, state);
      if (this.cooldownManager) {
        this.cooldownManager.startCooldown(providerId, 'LOCAL_POLICY', reason, durationOrConfig);
      }
    } else if (durationOrConfig && typeof durationOrConfig === 'object') {
      if (!durationOrConfig.inCooldown) {
        this.manualCooldowns.delete(providerId);
        if (this.cooldownManager) {
          this.cooldownManager.clearCooldown(providerId);
        }
      } else {
        const expiresAt = durationOrConfig.expiresAt || (Date.now() + 30000);
        const state: ProviderCooldownState = {
          providerId,
          inCooldown: true,
          reason: durationOrConfig.reason || reason,
          expiresAt
        };
        this.manualCooldowns.set(providerId, state);
        if (this.cooldownManager) {
          this.cooldownManager.startCooldown(providerId, 'LOCAL_POLICY', durationOrConfig.reason || reason, expiresAt - Date.now());
        }
      }
    }
  }

  setProviderQuotaPolicy(providerId: string, policy: ProviderQuotaPolicy): void {
    this.manualQuotaPolicies.set(providerId, policy);
  }

  reset(): void {
    this.disabledProviders.clear();
    this.manualCooldowns.clear();
    this.manualQuotaPolicies.clear();
    this.totalEvaluations = 0;
    this.totalAllowed = 0;
    this.totalDenied = 0;
  }

  destroy(): void {
    this.reset();
  }
}
