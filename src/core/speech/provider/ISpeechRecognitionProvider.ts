import { AudioChunk, SpeechSegment } from '../../audio/processing/AudioProcessingTypes';
import { SpeechProviderCapabilities, SpeechProviderHealth } from './SpeechProviderTypes';
import { RecognitionResult } from '../transcript/TranscriptTypes';

export type RecognitionResultCallback = (result: RecognitionResult) => void;

export interface ISpeechRecognitionProvider {
  readonly id: string;
  readonly name: string;
  readonly capabilities: SpeechProviderCapabilities;

  initialize(): Promise<void>;
  startSession(sessionId: string, language: string, onResult: RecognitionResultCallback): Promise<void>;
  acceptAudioChunk(chunk: AudioChunk): Promise<void>;
  acceptSpeechSegment(segment: SpeechSegment): Promise<void>;
  flush(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stopSession(sessionId: string): Promise<void>;
  healthCheck(): Promise<SpeechProviderHealth>;
  destroy(): void;
}
