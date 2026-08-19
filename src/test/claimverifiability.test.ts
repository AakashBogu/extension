import { describe, it, expect } from 'vitest';
import { ClaimVerifiabilityClassifier } from '../core/claims/classification/ClaimVerifiabilityClassifier';

describe('Module 5: ClaimVerifiabilityClassifier', () => {
  it('should evaluate verifiability levels', () => {
    const classifier = new ClaimVerifiabilityClassifier();
    expect(classifier.classifyVerifiability(['NUMERICAL'], 'Inflation is 5%')).toBe('HIGH');
  });
});
