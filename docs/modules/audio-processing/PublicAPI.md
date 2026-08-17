# Real-Time Audio Processing & Voice Activity Detection Engine - Public API Specifications

```typescript
export class AudioProcessingEngine {
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  processAudioData(channelBuffers: Float32Array[], inputSampleRate: number): void;
  getStatus(): AudioProcessingLifecycleStatus;
  getMetrics(): AudioProcessingMetrics;
  healthCheck(): { healthy: boolean; status: AudioProcessingLifecycleStatus; metrics: AudioProcessingMetrics };
  destroy(): void;
}
```
