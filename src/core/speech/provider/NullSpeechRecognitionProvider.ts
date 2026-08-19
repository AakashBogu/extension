import { ISpeechRecognitionProvider, RecognitionResultCallback } from './ISpeechRecognitionProvider';
import { SpeechProviderCapabilities, SpeechProviderHealth } from './SpeechProviderTypes';
import { AudioChunk, SpeechSegment } from '../../audio/processing/AudioProcessingTypes';

export class NullSpeechRecognitionProvider implements ISpeechRecognitionProvider {
  public readonly id = 'null-speech-provider';
  public readonly name = 'NullSpeechRecognitionProvider';
  public readonly capabilities: SpeechProviderCapabilities = {
    providerId: this.id,
    providerName: this.name,
    supportsStreaming: true,
    supportsPartialResults: true,
    supportsWordTimestamps: true,
    supportsDiarization: false,
    supportedLanguages: ['en-US', 'en-GB', 'ur-PK', 'hi-IN', 'sd-PK'],
    priority: 100
  };

  private activeSessionId: string | null = null;
  private onResultCallback: RecognitionResultCallback | null = null;
  private isInitialized = false;
  private processedChunks = 0;
  private sequenceCounter = 0;

  async initialize(): Promise<void> {
    this.isInitialized = true;
  }

  async startSession(sessionId: string, _language: string, onResult: RecognitionResultCallback): Promise<void> {
    this.activeSessionId = sessionId;
    this.onResultCallback = onResult;
  }

  async acceptAudioChunk(chunk: AudioChunk): Promise<void> {
    if (!this.activeSessionId || !this.onResultCallback || !chunk) return;

    this.processedChunks++;
    this.sequenceCounter++;

    // Emit simulated partial result
    this.onResultCallback({
      id: `res_partial_${this.sequenceCounter}`,
      sessionId: this.activeSessionId,
      providerId: this.id,
      timestamp: Date.now(),
      sequenceNumber: this.sequenceCounter,
      isFinal: false,
      confidence: 0.85,
      language: 'en-US',
      text: `Recognized audio chunk #${chunk.sequenceNumber}`,
      startTime: chunk.timestamp,
      endTime: chunk.timestamp + chunk.durationMs
    });

    // Emit final result
    this.onResultCallback({
      id: `res_final_${this.sequenceCounter}`,
      sessionId: this.activeSessionId,
      providerId: this.id,
      timestamp: Date.now(),
      sequenceNumber: this.sequenceCounter,
      isFinal: true,
      confidence: 0.92,
      language: 'en-US',
      text: `Recognized final transcript for chunk #${chunk.sequenceNumber}.`,
      startTime: chunk.timestamp,
      endTime: chunk.timestamp + chunk.durationMs
    });
  }

  async acceptSpeechSegment(_segment: SpeechSegment): Promise<void> {}

  async flush(): Promise<void> {}
  async pause(): Promise<void> {}
  async resume(): Promise<void> {}

  async stopSession(_sessionId: string): Promise<void> {
    this.activeSessionId = null;
    this.onResultCallback = null;
  }

  async healthCheck(): Promise<SpeechProviderHealth> {
    return {
      ready: this.isInitialized,
      providerId: this.id,
      activeSessions: this.activeSessionId ? 1 : 0,
      averageLatencyMs: 5,
      errorCount: 0
    };
  }

  destroy(): void {
    this.isInitialized = false;
    this.activeSessionId = null;
    this.onResultCallback = null;
  }
}
