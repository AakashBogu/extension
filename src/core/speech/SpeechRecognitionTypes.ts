export type SpeechRecognitionEngineStatus =
  | 'IDLE'
  | 'INITIALIZING'
  | 'READY'
  | 'STARTING'
  | 'LISTENING'
  | 'PROCESSING'
  | 'PAUSED'
  | 'FLUSHING'
  | 'STOPPING'
  | 'STOPPED'
  | 'ERROR'
  | 'RECOVERING'
  | 'DESTROYED';

export interface SpeechRecognitionConfig {
  enabled: boolean;
  language: string;
  alternativeLanguages: string[];
  enablePartialResults: boolean;
  enablePunctuation: boolean;
  enableWordTimestamps: boolean;
  enableSpeakerDiarization: boolean;
  maxAlternatives: number;
  confidenceThreshold: number;
  chunkTimeoutMs: number;
  sessionTimeoutMs: number;
  providerPreference: string[];
  fallbackEnabled: boolean;
}
