export interface ProviderHealthScoringPolicyConfig {
  readonly reliabilityWeight?: number;
  readonly latencyWeight?: number;
  readonly rateLimitWeight?: number;
  readonly quotaWeight?: number;
  readonly cooldownWeight?: number;
  readonly targetLatencyMs?: number;
  readonly degradedThreshold?: number;
  readonly unhealthyThreshold?: number;
}

export class ProviderHealthScoringPolicy {
  public readonly reliabilityWeight: number;
  public readonly latencyWeight: number;
  public readonly rateLimitWeight: number;
  public readonly quotaWeight: number;
  public readonly cooldownWeight: number;
  public readonly targetLatencyMs: number;
  public readonly degradedThreshold: number;
  public readonly unhealthyThreshold: number;

  constructor(config: ProviderHealthScoringPolicyConfig = {}) {
    this.reliabilityWeight = config.reliabilityWeight ?? 0.40;
    this.latencyWeight = config.latencyWeight ?? 0.20;
    this.rateLimitWeight = config.rateLimitWeight ?? 0.15;
    this.quotaWeight = config.quotaWeight ?? 0.15;
    this.cooldownWeight = config.cooldownWeight ?? 0.10;
    this.targetLatencyMs = config.targetLatencyMs ?? 1000;
    this.degradedThreshold = config.degradedThreshold ?? 0.70;
    this.unhealthyThreshold = config.unhealthyThreshold ?? 0.40;
  }
}
