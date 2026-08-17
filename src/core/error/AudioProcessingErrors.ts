import { AppError } from './AppError';

export class AudioProcessingError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_AUDIO_PROCESSING', details);
    this.name = 'AudioProcessingError';
  }
}

export class PCMExtractionError extends AppError {
  constructor(reason: string) {
    super(`PCM extraction error: ${reason}`, 'ERR_PCM_EXTRACTION', { reason });
    this.name = 'PCMExtractionError';
  }
}

export class ResamplingError extends AppError {
  constructor(fromRate: number, toRate: number, reason: string) {
    super(`Resampling error from ${fromRate}Hz to ${toRate}Hz: ${reason}`, 'ERR_AUDIO_RESAMPLING', { fromRate, toRate, reason });
    this.name = 'ResamplingError';
  }
}

export class FrameGenerationError extends AppError {
  constructor(reason: string) {
    super(`Audio frame generation error: ${reason}`, 'ERR_FRAME_GENERATION', { reason });
    this.name = 'FrameGenerationError';
  }
}

export class AudioChunkError extends AppError {
  constructor(reason: string) {
    super(`Audio chunk management error: ${reason}`, 'ERR_AUDIO_CHUNK', { reason });
    this.name = 'AudioChunkError';
  }
}

export class VADProcessingError extends AppError {
  constructor(reason: string) {
    super(`VAD processing error: ${reason}`, 'ERR_VAD_PROCESSING', { reason });
    this.name = 'VADProcessingError';
  }
}

export class SpeechSegmentError extends AppError {
  constructor(reason: string) {
    super(`Speech segment error: ${reason}`, 'ERR_SPEECH_SEGMENT', { reason });
    this.name = 'SpeechSegmentError';
  }
}

export class AudioBackpressureError extends AppError {
  constructor(queueSize: number, maxAllowed: number) {
    super(`Audio backpressure limit exceeded: queue size ${queueSize} exceeds max ${maxAllowed}`, 'ERR_AUDIO_BACKPRESSURE', { queueSize, maxAllowed });
    this.name = 'AudioBackpressureError';
  }
}
