import { describe, it, expect } from 'vitest';
import { PartialClaimBuffer } from '../core/claims/context/PartialClaimBuffer';

describe('Module 5: PartialClaimBuffer', () => {
  it('should buffer partial transcript updates', () => {
    const buffer = new PartialClaimBuffer();
    buffer.updatePartial('Partial text...');
    expect(buffer.getPartial()).toBe('Partial text...');
  });
});
