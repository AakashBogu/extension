import { describe, it, expect } from 'vitest';
import { ClaimPriorityEngine } from '../core/claims/classification/ClaimPriorityEngine';

describe('Module 5: ClaimPriorityEngine', () => {
  it('should assign priority level based on verifiability and confidence', () => {
    const engine = new ClaimPriorityEngine();
    expect(engine.computePriority('HIGH', 0.9)).toBe('CRITICAL');
  });
});
