export class ClaimDetectionMetricsCollector {
  private metrics = {
    transcriptSegmentsProcessed: 0,
    sentencesDetected: 0,
    claimCandidatesDetected: 0,
    claimsExtracted: 0,
    claimsNormalized: 0,
    claimsClassified: 0,
    claimsQueued: 0,
    claimsReadyForVerification: 0,
    duplicateClaims: 0
  };

  recordSegmentProcessed(): void { this.metrics.transcriptSegmentsProcessed++; }
  recordCandidateDetected(): void { this.metrics.claimCandidatesDetected++; }
  recordClaimExtracted(): void { this.metrics.claimsExtracted++; this.metrics.claimsReadyForVerification++; }
  recordDuplicate(): void { this.metrics.duplicateClaims++; }

  getMetrics() {
    return { ...this.metrics };
  }
}
