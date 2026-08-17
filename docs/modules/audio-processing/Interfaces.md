# Real-Time Audio Processing & Voice Activity Detection Engine - Interfaces & Type Contracts

```typescript
export interface AudioFrame {
  id: string;
  sequenceNumber: number;
  timestamp: number;
  durationMs: number;
  sampleRate: number;
  channels: number;
  samples: Float32Array;
}
export interface AudioChunk {
  id: string;
  sequenceNumber: number;
  timestamp: number;
  durationMs: number;
  sampleRate: number;
  channels: number;
  samples: Float32Array;
}
export interface SpeechSegment {
  id: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  frameCount: number;
  confidence: number;
}
```
