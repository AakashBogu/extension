import { describe, it, expect } from 'vitest';
import { ClaimCandidateDetector } from '../core/claims/detection/ClaimCandidateDetector';

describe('Module 5: ClaimCandidateDetector', () => {
  it('should detect factual claim candidates and reject questions/opinions', () => {
    const detector = new ClaimCandidateDetector();

    const claimRes = detector.isClaimCandidate("Pakistan's population is over 240 million.");
    expect(claimRes.isCandidate).toBe(true);

    const questionRes = detector.isClaimCandidate("What time is the meeting?");
    expect(questionRes.isCandidate).toBe(false);
  });
});
