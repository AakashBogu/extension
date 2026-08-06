# Active Video Selection Engine - Interfaces & Type Contracts

```typescript
export interface VideoCandidateFactors {
  videoId: string;
  isPlaying: boolean;
  visibilityRatio: number;
  width: number;
  height: number;
  isFullscreen: boolean;
  isPictureInPicture: boolean;
  isMuted: boolean;
  isFocused: boolean;
  lastInteractedAt: number;
}
export interface CandidateScore {
  videoId: string;
  score: number;
  factors: VideoCandidateFactors;
}
```
