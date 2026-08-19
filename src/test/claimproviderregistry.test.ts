import { describe, it, expect } from 'vitest';
import { ClaimAnalysisProviderRegistry } from '../core/claims/provider/ClaimAnalysisProviderRegistry';
import { NullClaimAnalysisProvider } from '../core/claims/provider/NullClaimAnalysisProvider';

describe('Module 5: ClaimAnalysisProviderRegistry', () => {
  it('should register and retrieve claim analysis providers', () => {
    const registry = new ClaimAnalysisProviderRegistry();
    const provider = new NullClaimAnalysisProvider();

    registry.registerProvider(provider);
    expect(registry.getProvider(provider.id)).toBe(provider);
  });
});
