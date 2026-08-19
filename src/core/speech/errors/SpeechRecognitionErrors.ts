import { AppError } from '../../error/AppError';

export class SpeechRecognitionError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_SPEECH_RECOGNITION', details);
    this.name = 'SpeechRecognitionError';
  }
}

export class SpeechProviderError extends AppError {
  constructor(providerId: string, reason: string) {
    super(`Speech provider [${providerId}] error: ${reason}`, 'ERR_SPEECH_PROVIDER', { providerId, reason });
    this.name = 'SpeechProviderError';
  }
}

export class SpeechProviderNotFoundError extends AppError {
  constructor(providerId: string) {
    super(`Speech provider [${providerId}] not found or unavailable`, 'ERR_SPEECH_PROVIDER_NOT_FOUND', { providerId });
    this.name = 'SpeechProviderNotFoundError';
  }
}

export class RecognitionSessionError extends AppError {
  constructor(sessionId: string, reason: string) {
    super(`Recognition session [${sessionId}] error: ${reason}`, 'ERR_RECOGNITION_SESSION', { sessionId, reason });
    this.name = 'RecognitionSessionError';
  }
}

export class TranscriptAggregationError extends AppError {
  constructor(reason: string) {
    super(`Transcript aggregation error: ${reason}`, 'ERR_TRANSCRIPT_AGGREGATION', { reason });
    this.name = 'TranscriptAggregationError';
  }
}

export class TranscriptValidationError extends AppError {
  constructor(field: string, reason: string) {
    super(`Transcript validation failed for [${field}]: ${reason}`, 'ERR_TRANSCRIPT_VALIDATION', { field, reason });
    this.name = 'TranscriptValidationError';
  }
}

export class SpeechRecognitionRecoveryError extends AppError {
  constructor(attempts: number, reason: string) {
    super(`Speech recognition recovery failed after ${attempts} attempts: ${reason}`, 'ERR_SPEECH_RECOGNITION_RECOVERY', { attempts, reason });
    this.name = 'SpeechRecognitionRecoveryError';
  }
}

export class SpeechRecognitionTimeoutError extends AppError {
  constructor(timeoutMs: number) {
    super(`Speech recognition operation timed out after ${timeoutMs}ms`, 'ERR_SPEECH_RECOGNITION_TIMEOUT', { timeoutMs });
    this.name = 'SpeechRecognitionTimeoutError';
  }
}
