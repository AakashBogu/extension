export interface ProviderQuotaRoutingPolicyConfig {
  readonly minimumRemainingQuotaRatio?: number;
  readonly preferredUtilizationCeiling?: number;
  readonly excludeExhausted?: boolean;
  readonly avoidCriticalState?: boolean;
}

export class ProviderQuotaRoutingPolicy {
  public readonly minimumRemainingQuotaRatio: number;
  public readonly preferredUtilizationCeiling: number;
  public readonly excludeExhausted: boolean;
  public readonly avoidCriticalState: boolean;

  constructor(config: ProviderQuotaRoutingPolicyConfig = {}) {
    this.minimumRemainingQuotaRatio = config.minimumRemainingQuotaRatio ?? 0.05;
    this.preferredUtilizationCeiling = config.preferredUtilizationCeiling ?? 0.95;
    this.excludeExhausted = config.excludeExhausted ?? true;
    this.avoidCriticalState = config.avoidCriticalState ?? false;
  }
}
