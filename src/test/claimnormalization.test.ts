import { describe, it, expect } from 'vitest';
import { ClaimNormalizer } from '../core/claims/extraction/ClaimNormalizer';

describe('Module 5: ClaimNormalizer', () => {
  it('should normalize spoken numbers, percentages, and dates', () => {
    const normalizer = new ClaimNormalizer();
    expect(normalizer.normalizeClaimText('five percent')).toBe('5%');
    expect(normalizer.normalizeClaimText('twenty twenty-five')).toBe('2025');
  });
});
