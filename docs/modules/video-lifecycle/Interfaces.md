# Video Lifecycle Manager - Interfaces & Type Contracts

```typescript
export type VideoLifecycleState = "UNKNOWN" | "DISCOVERED" | "METADATA_LOADING" | "METADATA_READY" | "READY" | "CAN_PLAY" | "PLAYING" | "PAUSED" | "BUFFERING" | "SEEKING" | "WAITING" | "STALLED" | "ENDED" | "DESTROYED";
export interface VideoLifecycleEntry {
  videoId: string;
  currentState: VideoLifecycleState;
  previousState: VideoLifecycleState;
  history: LifecycleTransition[];
  lastEvent: string;
}
```
