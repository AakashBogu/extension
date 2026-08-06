# Active Video Selection Engine - Developer Guide

```typescript
import { ActiveVideoManager } from '@core/video/selection/ActiveVideoManager';

const manager = new ActiveVideoManager(eventBus, stateStore);
manager.addCandidate('v1', { isPlaying: true, visibilityRatio: 1.0 });

const activeId = manager.getActiveVideoId();
console.log('Active video ID:', activeId);
```
