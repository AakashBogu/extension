import { ClaimCandidate } from '../ClaimTypes';

export class ClaimDeduplicationManager {
  private seenClaims = new Map<string, ClaimCandidate>();

  processCandidate(candidate: ClaimCandidate): { isDuplicate: boolean; canonical: ClaimCandidate } {
    const key = candidate.normalizedText.toLowerCase();
    const existing = this.seenClaims.get(key);

    if (existing) {
      existing.occurrenceCount++;
      existing.lastSeenAt = Date.now();
      existing.status = 'DUPLICATE';
      return { isDuplicate: true, canonical: existing };
    }

    this.seenClaims.set(key, candidate);
    return { isDuplicate: false, canonical: candidate };
  }

  clear(): void {
    this.seenClaims.clear();
  }
}
