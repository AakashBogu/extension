export interface ProviderCircuitPolicyConfig {
  readonly failureThreshold?: number;
  readonly rollingFailureThreshold?: number;
  readonly minimumRollingSamples?: number;
  readonly openDurationMs?: number;
  readonly halfOpenProbeTimeoutMs?: number;
  readonly maxHalfOpenProbes?: number;
  readonly successesToClose?: number;
  readonly failureBackoffFactor?: number;
  readonly maxOpenDurationMs?: number;
  readonly enabled?: boolean;
}

export class ProviderCircuitPolicy {
  public readonly failureThreshold: number;
  public readonly rollingFailureThreshold: number;
  public readonly minimumRollingSamples: number;
  public readonly openDurationMs: number;
  public readonly halfOpenProbeTimeoutMs: number;
  public readonly maxHalfOpenProbes: number;
  public readonly successesToClose: number;
  public readonly failureBackoffFactor: number;
  public readonly maxOpenDurationMs: number;
  public readonly enabled: boolean;

  constructor(config: ProviderCircuitPolicyConfig = {}) {
    this.failureThreshold = config.failureThreshold ?? 5;
    this.rollingFailureThreshold = config.rollingFailureThreshold ?? 0.60;
    this.minimumRollingSamples = config.minimumRollingSamples ?? 10;
    this.openDurationMs = config.openDurationMs ?? 30000;
    this.halfOpenProbeTimeoutMs = config.halfOpenProbeTimeoutMs ?? 10000;
    this.maxHalfOpenProbes = config.maxHalfOpenProbes ?? 1;
    this.successesToClose = config.successesToClose ?? 1;
    this.failureBackoffFactor = config.failureBackoffFactor ?? 2;
    this.maxOpenDurationMs = config.maxOpenDurationMs ?? 300000;
    this.enabled = config.enabled ?? true;

    if (this.failureThreshold <= 0 || !Number.isInteger(this.failureThreshold)) {
      throw new Error('failureThreshold must be a positive integer');
    }
    if (this.rollingFailureThreshold <= 0 || this.rollingFailureThreshold > 1.0) {
      throw new Error('rollingFailureThreshold must be between 0 and 1');
    }
  }
}
