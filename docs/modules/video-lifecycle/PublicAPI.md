# Video Lifecycle Manager - Public API Specifications

```typescript
export class VideoLifecycleManager {
  attachVideo(videoId: string, videoEl: HTMLVideoElement): void;
  detachVideo(videoId: string, videoEl: HTMLVideoElement): void;
  handleVideoEvent(videoId: string, eventName: string): void;
}
export class VideoLifecycleRegistry {
  getLifecycleEntry(videoId: string): VideoLifecycleEntry | undefined;
  listEntries(): VideoLifecycleEntry[];
}
```
