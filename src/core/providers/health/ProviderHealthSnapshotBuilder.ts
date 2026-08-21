import { ProviderHealthScore, ProviderRoutingScore } from './ProviderHealthTypes';

export class ProviderHealthSnapshotBuilder {
  static createHealthSnapshot(score: ProviderHealthScore): ProviderHealthScore {
    return { ...score };
  }

  static createRoutingSnapshot(score: ProviderRoutingScore): ProviderRoutingScore {
    return { ...score };
  }
}
