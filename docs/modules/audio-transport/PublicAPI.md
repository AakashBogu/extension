# Real-Time Audio Transport, Bounded Chunk Queue & Speech Pipeline Boundary - Public API Specifications

```typescript
export class AudioTransportEngine {
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  drain(): Promise<void>;
  getStatus(): AudioTransportStatus;
  getMetrics(): AudioTransportMetrics;
  healthCheck(): Promise<AudioTransportHealth>;
  destroy(): void;
}
```
