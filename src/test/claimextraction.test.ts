import { describe, it, expect } from 'vitest';
import { ClaimExtractor } from '../core/claims/extraction/ClaimExtractor';

describe('Module 5: ClaimExtractor', () => {
  it('should extract and normalize claim propositions', () => {
    const extractor = new ClaimExtractor();
    const result = extractor.extractProposition('Inflation fell by ten percent last year.');

    expect(result.extractedText).toBe('Inflation fell by ten percent last year.');
    expect(result.normalizedText).toBe('Inflation fell by 10% last year.');
  });
});
