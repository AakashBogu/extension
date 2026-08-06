# Video Discovery Engine - Developer Guide

```typescript
import { VideoDiscoveryEngine } from '@core/video/VideoDiscoveryEngine';

const engine = new VideoDiscoveryEngine(eventBus, stateStore);
engine.startDiscovery();

const activeVideo = engine.registry.getActiveVideo();
console.log('Active video:', activeVideo?.src);
```
