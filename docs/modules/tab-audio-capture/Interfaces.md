# Real-Time Tab Audio Capture Engine - Interfaces & Type Contracts

```typescript
export interface TabCaptureSessionRecord {
  sessionId: string;
  tabId: number;
  createdAt: number;
  startedAt: number;
  status: TabCaptureStatus;
  audioTrackCount: number;
}
export interface AudioTrackMetadata {
  id: string;
  kind: string;
  label: string;
  enabled: boolean;
  muted: boolean;
  readyState: string;
}
```
