# Video Lifecycle Manager - Developer Guide

```typescript
import { VideoLifecycleManager } from '@core/video/lifecycle/VideoLifecycleManager';

const manager = new VideoLifecycleManager(eventBus, stateStore);
manager.attachVideo('v1', videoElement);

const entry = manager.registry.getLifecycleEntry('v1');
console.log('Current lifecycle state:', entry?.currentState);
```
