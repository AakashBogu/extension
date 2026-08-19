import { ProviderRateLimitSnapshot } from './ProviderRateLimitTypes';
import { ExtendedRateLimitState } from './ProviderRateLimitStateTypes';

export class ProviderRateLimitSnapshotBuilder {
  static buildSnapshot(
    providerId: string,
    evaluatedStates: ExtendedRateLimitState[]
  ): ProviderRateLimitSnapshot {
    let highestRatio = -1;

    evaluatedStates.forEach(s => {
      if (s.utilizationRatio > highestRatio) {
        highestRatio = s.utilizationRatio;
      }
    });

    const finalStates: ExtendedRateLimitState[] = evaluatedStates.map(s => ({
      ...s,
      isLimiting: s.isExhausted || (highestRatio > 0 && s.utilizationRatio === highestRatio)
    }));

    return {
      providerId,
      timestamp: Date.now(),
      limits: finalStates
    };
  }
}
