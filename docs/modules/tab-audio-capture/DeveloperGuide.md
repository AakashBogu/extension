# Real-Time Tab Audio Capture Engine - Developer Guide

```typescript
import { TabAudioCaptureManager } from '@core/audio/capture/TabAudioCaptureManager';

const manager = new TabAudioCaptureManager(offscreenRuntime, eventBus, stateStore);
await manager.startCapture(tabId);

const session = manager.getCurrentSession();
console.log('Capture status:', session?.status, 'Tracks:', session?.audioTrackCount);
```
