export interface ProviderRoutingWeightsConfig {
  readonly healthWeight?: number;
  readonly reliabilityWeight?: number;
  readonly latencyWeight?: number;
  readonly quotaWeight?: number;
  readonly rateLimitWeight?: number;
  readonly priorityWeight?: number;
  readonly adaptiveWeight?: number;
}

export class ProviderRoutingWeights {
  public readonly healthWeight: number;
  public readonly reliabilityWeight: number;
  public readonly latencyWeight: number;
  public readonly quotaWeight: number;
  public readonly rateLimitWeight: number;
  public readonly priorityWeight: number;
  public readonly adaptiveWeight: number;

  constructor(config: ProviderRoutingWeightsConfig = {}) {
    const hw = config.healthWeight ?? 0.35;
    const rw = config.reliabilityWeight ?? 0.20;
    const lw = config.latencyWeight ?? 0.15;
    const qw = config.quotaWeight ?? 0.10;
    const rlw = config.rateLimitWeight ?? 0.10;
    const pw = config.priorityWeight ?? 0.05;
    const aw = config.adaptiveWeight ?? 0.05;

    if (hw < 0 || rw < 0 || lw < 0 || qw < 0 || rlw < 0 || pw < 0 || aw < 0) {
      throw new Error('Routing weights cannot be negative');
    }
    if (![hw, rw, lw, qw, rlw, pw, aw].every(Number.isFinite)) {
      throw new Error('Routing weights must be finite numbers');
    }

    const total = hw + rw + lw + qw + rlw + pw + aw;
    if (total === 0) {
      throw new Error('Total weight cannot be zero');
    }

    // Normalize weights so they sum to 1.0
    this.healthWeight = parseFloat((hw / total).toFixed(4));
    this.reliabilityWeight = parseFloat((rw / total).toFixed(4));
    this.latencyWeight = parseFloat((lw / total).toFixed(4));
    this.quotaWeight = parseFloat((qw / total).toFixed(4));
    this.rateLimitWeight = parseFloat((rlw / total).toFixed(4));
    this.priorityWeight = parseFloat((pw / total).toFixed(4));
    this.adaptiveWeight = parseFloat((aw / total).toFixed(4));
  }
}
