export interface ProviderAdmissionPolicyConfig {
  readonly warningsBlockAdmission?: boolean;
  readonly failOpenOnUnknown?: boolean;
  readonly minRemainingCapacityRatio?: number;
  readonly enforceCooldown?: boolean;
  readonly enforceQuota?: boolean;
  readonly enforceRateLimit?: boolean;
  readonly enforceCapacity?: boolean;
}

export class ProviderAdmissionPolicy {
  public readonly warningsBlockAdmission: boolean;
  public readonly failOpenOnUnknown: boolean;
  public readonly minRemainingCapacityRatio: number;
  public readonly enforceCooldown: boolean;
  public readonly enforceQuota: boolean;
  public readonly enforceRateLimit: boolean;
  public readonly enforceCapacity: boolean;

  constructor(config: ProviderAdmissionPolicyConfig = {}) {
    this.warningsBlockAdmission = config.warningsBlockAdmission ?? false;
    this.failOpenOnUnknown = config.failOpenOnUnknown ?? false;
    this.minRemainingCapacityRatio = config.minRemainingCapacityRatio ?? 0;
    this.enforceCooldown = config.enforceCooldown ?? true;
    this.enforceQuota = config.enforceQuota ?? true;
    this.enforceRateLimit = config.enforceRateLimit ?? true;
    this.enforceCapacity = config.enforceCapacity ?? true;
  }
}
