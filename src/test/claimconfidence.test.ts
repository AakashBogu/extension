import { describe, it, expect } from 'vitest';
import { ClaimConfidenceScorer } from '../core/claims/classification/ClaimConfidenceScorer';

describe('Module 5: ClaimConfidenceScorer', () => {
  it('should compute claim detection confidence', () => {
    const scorer = new ClaimConfidenceScorer();
    const score = scorer.computeConfidence(3, 'HIGH');
    expect(score).toBeGreaterThanOrEqual(0.8);
  });
});
