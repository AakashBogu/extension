import { ClaimAnalysisProviderRegistry } from './ClaimAnalysisProviderRegistry';
import { IClaimAnalysisProvider } from './IClaimAnalysisProvider';

export class ClaimAnalysisProviderRouter {
  constructor(private registry: ClaimAnalysisProviderRegistry) {}

  selectProvider(preferredId?: string): IClaimAnalysisProvider {
    if (preferredId) {
      const preferred = this.registry.getProvider(preferredId);
      if (preferred) return preferred;
    }
    const providers = this.registry.listProviders();
    return providers[0];
  }
}
