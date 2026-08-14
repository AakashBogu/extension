# Real-Time Tab Audio Capture Engine - Public API Specifications

```typescript
export class TabAudioCaptureManager {
  startCapture(tabId: number, streamMock?: MediaStream): Promise<TabCaptureSessionRecord>;
  stopCapture(): Promise<void>;
  pauseCapture(): Promise<void>;
  resumeCapture(): Promise<void>;
  getStatus(): TabCaptureStatus;
  getCurrentSession(): TabCaptureSessionRecord | undefined;
}
```
