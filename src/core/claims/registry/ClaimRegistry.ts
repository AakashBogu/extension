import { ClaimCandidate, VerifiableClaim } from '../ClaimTypes';

export class ClaimRegistry {
  private claims = new Map<string, ClaimCandidate>();

  registerClaim(candidate: ClaimCandidate): void {
    this.claims.set(candidate.claimId, candidate);
  }

  getClaim(claimId: string): ClaimCandidate | undefined {
    return this.claims.get(claimId);
  }

  getVerifiableClaims(): VerifiableClaim[] {
    return Array.from(this.claims.values())
      .filter(c => c.status === 'READY_FOR_VERIFICATION' || c.status === 'CLASSIFIED')
      .map(c => ({
        claimId: c.claimId,
        text: c.text,
        normalizedText: c.normalizedText,
        classification: c.classification,
        verifiability: c.verifiability,
        confidence: c.detectionConfidence,
        priority: c.priority,
        entities: c.entities,
        provenance: c.provenance,
        timestamps: {
          startTime: c.provenance.startTime,
          endTime: c.provenance.endTime
        },
        occurrenceCount: c.occurrenceCount
      }));
  }

  clear(): void {
    this.claims.clear();
  }
}
