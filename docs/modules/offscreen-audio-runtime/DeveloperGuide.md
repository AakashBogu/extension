# Offscreen Audio Runtime - Developer Guide

```typescript
import { OffscreenRuntimeManager } from '@core/offscreen/OffscreenRuntimeManager';

const manager = new OffscreenRuntimeManager(eventBus, stateStore);
await manager.runtime.start();

const status = manager.runtime.getStatus();
console.log('Offscreen document status:', status.docStatus, 'AudioContext state:', status.audioState);
```
