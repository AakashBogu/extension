import { describe, it, expect } from 'vitest';
import { ClaimAnalysisProviderRegistry } from '../core/claims/provider/ClaimAnalysisProviderRegistry';
import { ClaimAnalysisProviderRouter } from '../core/claims/provider/ClaimAnalysisProviderRouter';
import { NullClaimAnalysisProvider } from '../core/claims/provider/NullClaimAnalysisProvider';

describe('Module 5: ClaimAnalysisProviderRouter', () => {
  it('should route requests to available claim analysis providers', () => {
    const registry = new ClaimAnalysisProviderRegistry();
    const provider = new NullClaimAnalysisProvider();
    registry.registerProvider(provider);

    const router = new ClaimAnalysisProviderRouter(registry);
    expect(router.selectProvider().id).toBe(provider.id);
  });
});
