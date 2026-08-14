# Offscreen Audio Runtime - Public API Specifications

```typescript
export class OffscreenAudioRuntime {
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;
  getStatus(): { docStatus: OffscreenDocumentStatus; audioState: AudioContextState };
}
```
