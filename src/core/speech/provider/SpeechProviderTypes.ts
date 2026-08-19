export interface SpeechProviderCapabilities {
  providerId: string;
  providerName: string;
  supportsStreaming: boolean;
  supportsPartialResults: boolean;
  supportsWordTimestamps: boolean;
  supportsDiarization: boolean;
  supportedLanguages: string[];
  priority: number;
}

export interface SpeechProviderHealth {
  ready: boolean;
  providerId: string;
  activeSessions: number;
  averageLatencyMs: number;
  errorCount: number;
}
