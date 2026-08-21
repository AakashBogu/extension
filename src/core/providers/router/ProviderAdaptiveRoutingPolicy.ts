import { ProviderRoutingWeights, ProviderRoutingWeightsConfig } from './ProviderRoutingWeights';

export interface ProviderAdaptiveRoutingPolicyConfig {
  readonly emaAlpha?: number;
  readonly explorationBonusMax?: number;
  readonly minimumScoreDelta?: number;
  readonly stickinessBonus?: number;
  readonly requestType?: 'AI' | 'SEARCH';
  readonly weightsConfig?: ProviderRoutingWeightsConfig;
}

export class ProviderAdaptiveRoutingPolicy {
  public readonly emaAlpha: number;
  public readonly explorationBonusMax: number;
  public readonly minimumScoreDelta: number;
  public readonly stickinessBonus: number;
  public readonly requestType: 'AI' | 'SEARCH';
  public readonly weights: ProviderRoutingWeights;

  constructor(config: ProviderAdaptiveRoutingPolicyConfig = {}) {
    const alpha = config.emaAlpha ?? 0.15;
    const expMax = config.explorationBonusMax ?? 0.05;
    const delta = config.minimumScoreDelta ?? 0.03;
    const stickiness = config.stickinessBonus ?? 0.02;

    if (alpha <= 0 || alpha > 1.0 || !Number.isFinite(alpha)) {
      throw new Error('emaAlpha must be between 0 and 1');
    }
    if (expMax < 0 || expMax > 0.10 || !Number.isFinite(expMax)) {
      throw new Error('explorationBonusMax must be between 0 and 0.10');
    }
    if (delta < 0 || !Number.isFinite(delta)) {
      throw new Error('minimumScoreDelta must be non-negative');
    }

    this.emaAlpha = alpha;
    this.explorationBonusMax = expMax;
    this.minimumScoreDelta = delta;
    this.stickinessBonus = stickiness;
    this.requestType = config.requestType || 'AI';
    this.weights = new ProviderRoutingWeights(config.weightsConfig);
  }
}
