import { describe, it, expect } from 'vitest';
import { VerificationCacheManager } from '../core/verification/cache/VerificationCacheManager';
import { FactCheckVerdict } from '../core/verification/VerificationTypes';

describe('VerificationCacheManager', () => {
  const dummyVerdict: FactCheckVerdict = {
    verdictId: 'v1',
    claimId: 'c1',
    claimText: 'Earth orbits the sun',
    verdict: 'TRUE',
    confidenceScore: 0.99,
    verifiabilityScore: 0.99,
    summaryExplanation: 'Heliocentric solar system model.',
    topEvidence: [],
    stanceDistribution: { SUPPORTING: 1, REFUTING: 0, NEUTRAL: 0, INSUFFICIENT_EVIDENCE: 0, CONFLICTING: 0 },
    totalEvidenceCount: 1,
    executionTimeMs: 50,
    synthesizedAt: Date.now()
  };

  it('stores and retrieves cached domain verdicts', () => {
    const cache = new VerificationCacheManager(10, 60000);
    cache.set('c1', dummyVerdict);

    const hit = cache.get('c1');
    expect(hit).toBeDefined();
    expect(hit?.verdict).toBe('TRUE');
    expect(hit?.cached).toBe(true);
    expect(cache.getHitRate()).toBe(1.0);
  });

  it('evicts expired cache entries', async () => {
    const cache = new VerificationCacheManager(10, 10); // 10ms TTL
    cache.set('c1', dummyVerdict);

    await new Promise(r => setTimeout(r, 20));

    const expired = cache.get('c1');
    expect(expired).toBeUndefined();
    expect(cache.getStats().misses).toBe(1);
  });

  it('manages in-flight request deduplication promises', async () => {
    const cache = new VerificationCacheManager(10, 60000);
    const mockPromise = Promise.resolve(dummyVerdict);

    cache.setInFlight('c1', mockPromise);
    expect(cache.getInFlight('c1')).toBe(mockPromise);

    await mockPromise;
    // Cleared after promise completes
    expect(cache.getInFlight('c1')).toBeUndefined();
  });
});
