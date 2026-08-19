# Real-Time Audio Transport, Bounded Chunk Queue & Speech Pipeline Boundary - Developer Guide

```typescript
import { AudioTransportEngine } from '@core/audio/transport/AudioTransportEngine';

const engine = new AudioTransportEngine(config, adapter, eventBus, stateStore);
await engine.start();

console.log('Transport status:', engine.getStatus(), 'Metrics:', engine.getMetrics());
```
