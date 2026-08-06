# Playback Tracking Engine - Developer Guide

```typescript
import { PlaybackTrackingEngine } from '@core/video/playback/PlaybackTrackingEngine';

const engine = new PlaybackTrackingEngine(eventBus, stateStore);
engine.startTracking('v1', videoElement);

const record = engine.registry.getRecord('v1');
console.log('Watch time:', record?.metrics.watchTimeSeconds);
```
