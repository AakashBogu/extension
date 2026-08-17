import { NoiseFloorState, VADConfig, VADState } from './AudioProcessingTypes';

export class VoiceActivityDetector {
  private state: VADState = 'SILENCE';
  private noiseFloor: NoiseFloorState = { levelDb: -60, confidence: 1.0, lastUpdatedAt: Date.now() };
  private consecutiveSpeechFrames = 0;
  private silenceHangoverCounterMs = 0;

  constructor(private config: VADConfig) {}

  processFrame(db: number, frameDurationMs: number = 20): { state: VADState; confidence: number; isSpeech: boolean } {
    if (!this.config.enabled) {
      return { state: 'SILENCE', confidence: 0.0, isSpeech: false };
    }

    // Adaptive noise floor update during silence
    if (db < this.config.silenceThresholdDb) {
      this.noiseFloor.levelDb = 0.95 * this.noiseFloor.levelDb + 0.05 * db;
      this.noiseFloor.lastUpdatedAt = Date.now();
    }

    const isFrameSpeechCandidate = db > this.config.speechThresholdDb;

    switch (this.state) {
      case 'SILENCE':
        if (isFrameSpeechCandidate) {
          this.consecutiveSpeechFrames++;
          this.state = 'POSSIBLE_SPEECH';
        } else {
          this.consecutiveSpeechFrames = 0;
        }
        break;

      case 'POSSIBLE_SPEECH':
        if (isFrameSpeechCandidate) {
          this.consecutiveSpeechFrames++;
          if (this.consecutiveSpeechFrames >= this.config.speechStartFrames) {
            this.state = 'SPEECH';
            this.silenceHangoverCounterMs = this.config.silenceHangoverMs;
          }
        } else {
          this.consecutiveSpeechFrames = 0;
          this.state = 'SILENCE';
        }
        break;

      case 'SPEECH':
        if (!isFrameSpeechCandidate) {
          this.state = 'POSSIBLE_SILENCE';
          this.silenceHangoverCounterMs = this.config.silenceHangoverMs - frameDurationMs;
        } else {
          this.silenceHangoverCounterMs = this.config.silenceHangoverMs;
        }
        break;

      case 'POSSIBLE_SILENCE':
        if (isFrameSpeechCandidate) {
          this.state = 'SPEECH';
          this.silenceHangoverCounterMs = this.config.silenceHangoverMs;
        } else {
          this.silenceHangoverCounterMs -= frameDurationMs;
          if (this.silenceHangoverCounterMs <= 0) {
            this.state = 'SILENCE';
            this.consecutiveSpeechFrames = 0;
          }
        }
        break;
    }

    const isSpeech = this.state === 'SPEECH' || this.state === 'POSSIBLE_SILENCE';
    const confidence = this.calculateConfidence(db);

    return { state: this.state, confidence, isSpeech };
  }

  getNoiseFloor(): NoiseFloorState {
    return { ...this.noiseFloor };
  }

  getState(): VADState {
    return this.state;
  }

  reset(): void {
    this.state = 'SILENCE';
    this.consecutiveSpeechFrames = 0;
    this.silenceHangoverCounterMs = 0;
    this.noiseFloor = { levelDb: -60, confidence: 1.0, lastUpdatedAt: Date.now() };
  }

  private calculateConfidence(db: number): number {
    const minDb = this.config.silenceThresholdDb;
    const maxDb = this.config.speechThresholdDb;

    if (db <= minDb) return 0.0;
    if (db >= maxDb + 10) return 1.0;

    const conf = (db - minDb) / (maxDb + 10 - minDb);
    return Math.max(0.0, Math.min(1.0, conf));
  }
}
