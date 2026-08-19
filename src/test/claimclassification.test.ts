import { describe, it, expect } from 'vitest';
import { ClaimClassifier } from '../core/claims/classification/ClaimClassifier';

describe('Module 5: ClaimClassifier', () => {
  it('should classify text categories', () => {
    const classifier = new ClaimClassifier();
    const categories = classifier.classify('Inflation fell by 5%', ['NUMERICAL']);

    expect(categories).toContain('NUMERICAL');
  });
});
