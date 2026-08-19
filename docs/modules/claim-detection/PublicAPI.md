# Real-Time Claim Detection & Extraction Engine - Public API Specifications

```typescript
export class ClaimDetectionEngine {
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  processTranscriptSegment(segment: TranscriptSegmentRecord): ClaimCandidate[];
  processFinalizedTranscript(transcript: FinalizedTranscript): ClaimCandidate[];
  getVerifiableClaims(): VerifiableClaim[];
  getStatus(): ClaimDetectionStatus;
  getMetrics(): ClaimDetectionMetrics;
  healthCheck(): Promise<ClaimDetectionHealth>;
  destroy(): void;
}
```
