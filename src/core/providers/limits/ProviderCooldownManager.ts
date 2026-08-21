import { ProviderCooldownPolicy, ProviderCooldownPolicyConfig } from './ProviderCooldownPolicy';
import { ExtendedProviderCooldownState, ProviderCooldownManagerStatus, ProviderCooldownHealth } from './ProviderCooldownState';
import { CooldownSource } from './ProviderCooldownTypes';
import { ProviderCooldownEvaluator } from './ProviderCooldownEvaluator';
import { ProviderCooldownRecoveryManager } from './ProviderCooldownRecoveryManager';
import { IEventBus } from '../../events/IEventBus';

export class ProviderCooldownManager {
  public readonly policy: ProviderCooldownPolicy;
  private states = new Map<string, ExtendedProviderCooldownState>();
  private failureCounts = new Map<string, number>();
  private recoveryManager: ProviderCooldownRecoveryManager;

  private statusMetrics: ProviderCooldownManagerStatus = {
    totalActiveCooldowns: 0,
    totalCooldownsTriggered: 0,
    totalRecoveriesAttempted: 0,
    totalRecoveriesSucceeded: 0,
    lastCooldownAt: 0
  };

  constructor(
    policyConfig?: ProviderCooldownPolicy | ProviderCooldownPolicyConfig,
    private eventBus?: IEventBus
  ) {
    this.policy = policyConfig instanceof ProviderCooldownPolicy ? policyConfig : new ProviderCooldownPolicy(policyConfig);
    this.recoveryManager = new ProviderCooldownRecoveryManager(eventBus);
  }

  async initialize(): Promise<void> {}

  getEntityKey(providerId: string, modelId?: string): string {
    return modelId ? `${providerId}:${modelId}` : providerId;
  }

  getCooldown(providerId: string, modelId?: string): ExtendedProviderCooldownState | null {
    const key = this.getEntityKey(providerId, modelId);
    const state = this.states.get(key);
    if (!state) return null;

    if (state.inCooldown && Date.now() >= state.expiresAt) {
      // Cooldown expired
      this.clearCooldown(providerId, modelId);
      if (this.eventBus) {
        this.eventBus.publish('provider.cooldown_expired', { providerId, modelId, timestamp: Date.now() });
      }
      return null;
    }

    return state.inCooldown ? { ...state } : null;
  }

  isInCooldown(providerId: string, modelId?: string): boolean {
    return this.getCooldown(providerId, modelId) !== null;
  }

  getRemainingCooldownMs(providerId: string, modelId?: string): number {
    const cooldown = this.getCooldown(providerId, modelId);
    if (!cooldown) return 0;
    return Math.max(0, cooldown.expiresAt - Date.now());
  }

  startCooldown(
    providerId: string,
    source: CooldownSource,
    reason: string,
    retryAfterMs?: number,
    modelId?: string
  ): ExtendedProviderCooldownState {
    const key = this.getEntityKey(providerId, modelId);
    const currentFailures = (this.failureCounts.get(key) || 0) + 1;
    this.failureCounts.set(key, currentFailures);

    const bounds = ProviderCooldownEvaluator.determineExpiration(source, retryAfterMs, currentFailures, this.policy, Date.now());

    const state: ExtendedProviderCooldownState = {
      providerId,
      modelId,
      inCooldown: true,
      status: 'ACTIVE',
      reason,
      startedAt: Date.now(),
      expiresAt: bounds.expiresAt,
      durationMs: bounds.durationMs,
      source,
      retryAfterMs,
      consecutiveFailureCount: currentFailures,
      recoveryAttempts: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.states.set(key, state);
    this.statusMetrics.totalCooldownsTriggered++;
    this.statusMetrics.lastCooldownAt = Date.now();
    this.recalculateActiveCount();

    this.recoveryManager.scheduleRecovery(state, () => {
      this.clearCooldown(providerId, modelId);
    });

    if (this.eventBus) {
      this.eventBus.publish('provider.cooldown_started', {
        providerId,
        modelId,
        source,
        reason,
        expiresAt: bounds.expiresAt,
        durationMs: bounds.durationMs,
        failureCount: currentFailures,
        timestamp: Date.now()
      });
    }

    return state;
  }

  extendCooldown(
    providerId: string,
    additionalMs: number,
    reason?: string,
    modelId?: string
  ): ExtendedProviderCooldownState {
    const key = this.getEntityKey(providerId, modelId);
    let state = this.states.get(key);
    const safeAdd = Math.max(0, additionalMs);

    if (!state || !state.inCooldown) {
      return this.startCooldown(providerId, 'LOCAL_POLICY', reason || 'Cooldown extended', safeAdd, modelId);
    }

    const newExpiresAt = Math.min(Date.now() + this.policy.maxDurationMs, state.expiresAt + safeAdd);
    state = {
      ...state,
      expiresAt: newExpiresAt,
      durationMs: newExpiresAt - state.startedAt,
      reason: reason || state.reason,
      updatedAt: Date.now()
    };

    this.states.set(key, state);

    if (this.eventBus) {
      this.eventBus.publish('provider.cooldown_extended', {
        providerId,
        modelId,
        expiresAt: newExpiresAt,
        timestamp: Date.now()
      });
    }

    return state;
  }

  clearCooldown(providerId: string, modelId?: string): boolean {
    const key = this.getEntityKey(providerId, modelId);
    const existing = this.states.get(key);
    if (!existing) return false;

    this.recoveryManager.clearTimer(key);
    this.states.delete(key);
    this.recalculateActiveCount();

    if (this.eventBus) {
      this.eventBus.publish('provider.cooldown_cleared', { providerId, modelId, timestamp: Date.now() });
    }

    return true;
  }

  recordFailure(providerId: string, error: unknown, modelId?: string): ExtendedProviderCooldownState | null {
    const classification = ProviderCooldownEvaluator.classifyError(error, this.policy);
    if (!classification.shouldCooldown) {
      return null;
    }

    return this.startCooldown(
      providerId,
      classification.source,
      classification.reason,
      classification.retryAfterMs,
      modelId
    );
  }

  recordSuccess(providerId: string, modelId?: string): void {
    const key = this.getEntityKey(providerId, modelId);
    if (this.policy.successResetsFailures) {
      this.failureCounts.delete(key);
    }

    const state = this.states.get(key);
    if (state && !state.inCooldown) {
      this.clearCooldown(providerId, modelId);
    }
  }

  evaluate(providerId: string, modelId?: string): { inCooldown: boolean; state: ExtendedProviderCooldownState | null } {
    const state = this.getCooldown(providerId, modelId);
    return {
      inCooldown: state !== null,
      state
    };
  }

  getActiveCooldowns(): ExtendedProviderCooldownState[] {
    const active: ExtendedProviderCooldownState[] = [];
    this.states.forEach((state, key) => {
      if (state.inCooldown && Date.now() < state.expiresAt) {
        active.push({ ...state });
      } else {
        this.recoveryManager.clearTimer(key);
        this.states.delete(key);
      }
    });
    this.recalculateActiveCount();
    return active;
  }

  getStatus(): ProviderCooldownManagerStatus {
    this.recalculateActiveCount();
    return { ...this.statusMetrics };
  }

  async healthCheck(): Promise<ProviderCooldownHealth> {
    const activeCount = this.getActiveCooldowns().length;
    const status = activeCount > 3 ? 'UNHEALTHY' : activeCount > 0 ? 'DEGRADED' : 'HEALTHY';
    return {
      status,
      activeCooldownCount: activeCount,
      lastCheckedAt: Date.now()
    };
  }

  reset(): void {
    this.recoveryManager.reset();
    this.states.clear();
    this.failureCounts.clear();
    this.statusMetrics = {
      totalActiveCooldowns: 0,
      totalCooldownsTriggered: 0,
      totalRecoveriesAttempted: 0,
      totalRecoveriesSucceeded: 0,
      lastCooldownAt: 0
    };
  }

  destroy(): void {
    this.recoveryManager.destroy();
    this.reset();
  }

  private recalculateActiveCount(): void {
    let count = 0;
    const now = Date.now();
    this.states.forEach(s => {
      if (s.inCooldown && now < s.expiresAt) count++;
    });
    this.statusMetrics.totalActiveCooldowns = count;
  }
}
