import { ProviderLimitPolicy } from './ProviderLimitPolicy';
import { ProviderUsageTracker } from './ProviderUsageTracker';
import { ProviderRateLimitSnapshot, RateLimitDimension, RateLimitWindow, RateLimitState } from './ProviderRateLimitTypes';
import { ExtendedRateLimitState } from './ProviderRateLimitStateTypes';
import { ProviderRateLimitEvaluator } from './ProviderRateLimitEvaluator';
import { ProviderRateLimitSnapshotBuilder } from './ProviderRateLimitSnapshotBuilder';
import { IEventBus } from '../../events/IEventBus';

export class ProviderRateLimitStateTracker {
  private policies = new Map<string, ProviderLimitPolicy>();
  private snapshots = new Map<string, ProviderRateLimitSnapshot>();

  constructor(
    private usageTracker: ProviderUsageTracker,
    private eventBus?: IEventBus
  ) {}

  async initialize(): Promise<void> {}

  configureProviderLimits(providerId: string, policy: ProviderLimitPolicy): void {
    this.policies.set(providerId, policy);
    this.refreshProvider(providerId);
  }

  updateProviderUsage(providerId: string): ProviderRateLimitSnapshot {
    return this.refreshProvider(providerId);
  }

  refreshProvider(providerId: string): ProviderRateLimitSnapshot {
    const policy = this.policies.get(providerId) || new ProviderLimitPolicy();
    const evaluated: ExtendedRateLimitState[] = [];

    policy.limits.forEach(def => {
      const snapshot = this.usageTracker.getBucketSnapshot(providerId, def.window, def.customWindowMs);
      if (snapshot) {
        const state = ProviderRateLimitEvaluator.evaluate(def, snapshot, Date.now(), policy.safetyMarginRatio);
        evaluated.push(state);
      }
    });

    const snapshot = ProviderRateLimitSnapshotBuilder.buildSnapshot(providerId, evaluated);
    this.snapshots.set(providerId, snapshot);

    const isExhausted = evaluated.some(e => e.isExhausted);
    if (this.eventBus) {
      this.eventBus.publish('provider.rate_limit_updated', {
        providerId,
        isExhausted,
        timestamp: Date.now()
      });

      if (isExhausted) {
        this.eventBus.publish('provider.rate_limit_exhausted', {
          providerId,
          timestamp: Date.now()
        });
      }
    }

    return snapshot;
  }

  getProviderRateLimitState(providerId: string): ProviderRateLimitSnapshot | null {
    return this.snapshots.get(providerId) || this.refreshProvider(providerId);
  }

  getLimitState(
    providerId: string,
    dimension: RateLimitDimension,
    window: RateLimitWindow
  ): RateLimitState | null {
    const snapshot = this.getProviderRateLimitState(providerId);
    if (!snapshot) return null;
    return snapshot.limits.find(l => l.definition.dimension === dimension && l.definition.window === window) || null;
  }

  getLimitingStates(providerId: string): RateLimitState[] {
    const snapshot = this.getProviderRateLimitState(providerId);
    if (!snapshot) return [];
    return snapshot.limits.filter(l => (l as ExtendedRateLimitState).isLimiting);
  }

  getAllProviderStates(): ProviderRateLimitSnapshot[] {
    return Array.from(this.snapshots.values());
  }

  resetProvider(providerId: string): void {
    this.usageTracker.resetProvider(providerId);
    this.refreshProvider(providerId);
  }

  resetAll(): void {
    this.usageTracker.resetAll();
    this.snapshots.clear();
  }

  destroy(): void {
    this.policies.clear();
    this.snapshots.clear();
  }
}
