import { RateLimitDefinition } from './ProviderRateLimitTypes';

export type LimitEnforcementMode = 'STRICT' | 'DRY_RUN' | 'DISABLED';
export type LimitReservationBehavior = 'EAGER' | 'LAZY' | 'NONE';
export type LimitUnavailableStrategy = 'ALLOW' | 'BLOCK' | 'DEGRADE';

export interface ProviderLimitPolicyConfig {
  readonly enabled?: boolean;
  readonly limits?: ReadonlyArray<RateLimitDefinition>;
  readonly enforcementMode?: LimitEnforcementMode;
  readonly safetyMarginRatio?: number;
  readonly reservationBehavior?: LimitReservationBehavior;
  readonly allowUnknownLimits?: boolean;
  readonly defaultStrategyWhenUnavailable?: LimitUnavailableStrategy;
}

export class ProviderLimitPolicy {
  public readonly enabled: boolean;
  public readonly limits: ReadonlyArray<RateLimitDefinition>;
  public readonly enforcementMode: LimitEnforcementMode;
  public readonly safetyMarginRatio: number;
  public readonly reservationBehavior: LimitReservationBehavior;
  public readonly allowUnknownLimits: boolean;
  public readonly defaultStrategyWhenUnavailable: LimitUnavailableStrategy;

  constructor(config: ProviderLimitPolicyConfig = {}) {
    this.enabled = config.enabled ?? true;
    this.limits = config.limits ?? [];
    this.enforcementMode = config.enforcementMode ?? 'STRICT';
    this.safetyMarginRatio = config.safetyMarginRatio ?? 0.05; // 5% default safety margin
    this.reservationBehavior = config.reservationBehavior ?? 'LAZY';
    this.allowUnknownLimits = config.allowUnknownLimits ?? true;
    this.defaultStrategyWhenUnavailable = config.defaultStrategyWhenUnavailable ?? 'ALLOW';
  }
}
