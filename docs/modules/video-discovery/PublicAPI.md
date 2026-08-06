# Video Discovery Engine - Public API Specifications

```typescript
export class VideoDiscoveryEngine {
  startDiscovery(): void;
  stopDiscovery(): void;
}
export class VideoRegistry {
  registerVideo(el, metadata): string;
  unregisterVideo(id): void;
  getActiveVideo(): DiscoveredVideoMetadata | undefined;
  listVideos(): DiscoveredVideoMetadata[];
}
```
