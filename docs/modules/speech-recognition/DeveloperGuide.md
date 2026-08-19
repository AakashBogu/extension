# Provider-Agnostic Speech Recognition Pipeline - Developer Guide

```typescript
import { SpeechRecognitionEngine } from '@core/speech/SpeechRecognitionEngine';

const engine = new SpeechRecognitionEngine(config, eventBus, stateStore);
await engine.startSession(101, 'video_123', 'en-US');

const transcript = engine.getFinalizedTranscript();
console.log('Finalized Transcript for Module 5:', transcript);
```
