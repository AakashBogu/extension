export type QuotaExhaustionBehavior = 'BLOCK' | 'FALLBACK' | 'WARN_ONLY';

export interface QuotaPeriodLimit {
  readonly requests?: number;
  readonly tokens?: number;
  readonly cost?: number;
}

export interface ProviderQuotaPolicyConfig {
  readonly enabled?: boolean;
  readonly dailyLimits?: QuotaPeriodLimit;
  readonly monthlyLimits?: QuotaPeriodLimit;
  readonly warningThresholdRatio?: number;
  readonly exhaustionBehavior?: QuotaExhaustionBehavior;
}

export class ProviderQuotaPolicy {
  public readonly enabled: boolean;
  public readonly dailyLimits?: QuotaPeriodLimit;
  public readonly monthlyLimits?: QuotaPeriodLimit;
  public readonly warningThresholdRatio: number;
  public readonly exhaustionBehavior: QuotaExhaustionBehavior;

  constructor(config: ProviderQuotaPolicyConfig = {}) {
    this.enabled = config.enabled ?? true;
    this.dailyLimits = config.dailyLimits;
    this.monthlyLimits = config.monthlyLimits;
    this.warningThresholdRatio = config.warningThresholdRatio ?? 0.8; // 80% default warning threshold
    this.exhaustionBehavior = config.exhaustionBehavior ?? 'BLOCK';
  }
}
