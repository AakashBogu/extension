import { describe, it, expect } from 'vitest';
import { ClaimEntityExtractor } from '../core/claims/entity/ClaimEntityExtractor';

describe('Module 5: ClaimEntityExtractor', () => {
  it('should extract percentage and numerical entities', () => {
    const extractor = new ClaimEntityExtractor();
    const entities = extractor.extractEntities('GDP increased by 15% in 2024.');

    expect(entities.length).toBe(2);
    expect(entities[0].type).toBe('PERCENTAGE');
    expect(entities[1].type).toBe('NUMBER');
  });
});
