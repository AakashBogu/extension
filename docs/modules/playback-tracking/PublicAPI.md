# Playback Tracking Engine - Public API Specifications

```typescript
export class PlaybackTrackingEngine {
  startTracking(videoId: string, videoEl: HTMLVideoElement): void;
  stopTracking(videoId: string, videoEl: HTMLVideoElement): void;
  handlePlaybackEvent(videoId: string, videoEl: HTMLVideoElement, eventName: string): void;
}
export class PlaybackRegistry {
  getRecord(videoId: string): VideoPlaybackRecord | undefined;
  listRecords(): VideoPlaybackRecord[];
}
```
