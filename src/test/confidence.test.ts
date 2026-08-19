import { describe, it, expect } from 'vitest';
import { ConfidenceNormalizer } from '../core/speech/confidence/ConfidenceNormalizer';

describe('Module 4: ConfidenceNormalizer', () => {
  it('should clamp confidence scores between 0.0 and 1.0 and sanitize NaN', () => {
    const normalizer = new ConfidenceNormalizer();

    expect(normalizer.normalize(0.85)).toBe(0.85);
    expect(normalizer.normalize(1.5)).toBe(1.0);
    expect(normalizer.normalize(-0.2)).toBe(0.0);
    expect(normalizer.normalize(NaN)).toBe(0.5);
  });
});
