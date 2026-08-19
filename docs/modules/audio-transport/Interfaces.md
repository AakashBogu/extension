# Real-Time Audio Transport, Bounded Chunk Queue & Speech Pipeline Boundary - Interfaces & Type Contracts

```typescript
export interface ISpeechPipelineAdapter {
  name: string;
  initialize(): Promise<void>;
  acceptAudioChunk(chunk: AudioChunk): Promise<void>;
  acceptSpeechSegment(segment: SpeechSegment): Promise<void>;
  flush(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  healthCheck(): Promise<SpeechPipelineHealth>;
  destroy(): void;
}
```
