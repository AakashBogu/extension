# Playback Tracking Engine - Interfaces & Type Contracts

```typescript
export interface PlaybackState {
  videoId: string;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  muted: boolean;
  paused: boolean;
  seeking: boolean;
  isFullscreen: boolean;
  isPictureInPicture: boolean;
}
export interface PlaybackSnapshot {
  id: string;
  videoId: string;
  timestamp: number;
  timeDeltaMs: number;
  currentTimeDelta: number;
  progressPercent: number;
}
export interface PlaybackMetrics {
  watchTimeSeconds: number;
  pauseCount: number;
  seekCount: number;
  volumeChangeCount: number;
}
```
