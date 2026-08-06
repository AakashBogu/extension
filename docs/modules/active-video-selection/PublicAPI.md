# Active Video Selection Engine - Public API Specifications

```typescript
export class ActiveVideoManager {
  addCandidate(videoId: string, factors: Partial<VideoCandidateFactors>): void;
  removeCandidate(videoId: string): void;
  updateCandidateFactors(videoId: string, updates: Partial<VideoCandidateFactors>): void;
  evaluateActiveVideo(): string | null;
  getActiveVideoId(): string | null;
}
```
