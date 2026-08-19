# Provider-Agnostic Speech Recognition Pipeline - Public API Specifications

```typescript
export class SpeechRecognitionEngine implements ISpeechPipelineAdapter {
  initialize(): Promise<void>;
  startSession(tabId: number, videoId?: string, language?: string): Promise<string>;
  stopSession(): Promise<void>;
  acceptAudioChunk(chunk: AudioChunk): Promise<void>;
  acceptSpeechSegment(segment: SpeechSegment): Promise<void>;
  getFinalizedTranscript(): FinalizedTranscript | null;
  getStatus(): SpeechRecognitionEngineStatus;
  getMetrics(): SpeechRecognitionMetrics;
  healthCheck(): Promise<SpeechPipelineHealth>;
  destroy(): void;
}
```
