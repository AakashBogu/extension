# Real-Time Audio Processing & Voice Activity Detection Engine - Developer Guide

```typescript
import { AudioProcessingEngine } from '@core/audio/processing/AudioProcessingEngine';

const engine = new AudioProcessingEngine(config, captureManager, offscreenRuntime, eventBus);
await engine.start();

engine.processAudioData(channelData, 48000);
console.log('Processing metrics:', engine.getMetrics());
```
