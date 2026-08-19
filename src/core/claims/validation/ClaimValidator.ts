import { ClaimCandidate } from '../ClaimTypes';

export class ClaimValidator {
  validateCandidate(candidate: ClaimCandidate): boolean {
    return !!(candidate && candidate.claimId && candidate.text && candidate.normalizedText);
  }
}
