import { ProviderQuotaState } from './ProviderQuotaTypes';
import { ExtendedQuotaConsumption } from './ProviderQuotaState';

export class ProviderQuotaSnapshotBuilder {
  static buildSnapshot(
    providerId: string,
    consumptions: ExtendedQuotaConsumption[]
  ): ProviderQuotaState {
    let highestRatio = -1;
    consumptions.forEach(c => {
      if (c.utilizationRatio > highestRatio) {
        highestRatio = c.utilizationRatio;
      }
    });

    const finalConsumptions = consumptions.map(c => ({
      ...c,
      isLimiting: c.isExhausted || (highestRatio > 0 && c.utilizationRatio === highestRatio)
    }));

    return {
      providerId,
      timestamp: Date.now(),
      quotas: finalConsumptions
    };
  }
}
