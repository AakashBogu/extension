import { AppError } from './AppError';

export class AudioTransportError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_AUDIO_TRANSPORT', details);
    this.name = 'AudioTransportError';
  }
}

export class AudioQueueFullError extends AppError {
  constructor(queueSize: number, maxCapacity: number) {
    super(`Audio chunk queue is full (${queueSize}/${maxCapacity})`, 'ERR_AUDIO_QUEUE_FULL', { queueSize, maxCapacity });
    this.name = 'AudioQueueFullError';
  }
}

export class AudioTransportValidationError extends AppError {
  constructor(field: string, reason: string) {
    super(`Audio transport validation failed for [${field}]: ${reason}`, 'ERR_AUDIO_TRANSPORT_VALIDATION', { field, reason });
    this.name = 'AudioTransportValidationError';
  }
}

export class AudioTransportSequenceError extends AppError {
  constructor(expected: number, received: number) {
    super(`Audio chunk sequence gap detected: expected ${expected}, received ${received}`, 'ERR_AUDIO_TRANSPORT_SEQUENCE', { expected, received });
    this.name = 'AudioTransportSequenceError';
  }
}

export class SpeechPipelineBoundaryError extends AppError {
  constructor(reason: string) {
    super(`Speech pipeline boundary error: ${reason}`, 'ERR_SPEECH_PIPELINE_BOUNDARY', { reason });
    this.name = 'SpeechPipelineBoundaryError';
  }
}

export class SpeechPipelineAdapterError extends AppError {
  constructor(adapterName: string, reason: string) {
    super(`Speech pipeline adapter [${adapterName}] error: ${reason}`, 'ERR_SPEECH_PIPELINE_ADAPTER', { adapterName, reason });
    this.name = 'SpeechPipelineAdapterError';
  }
}

export class AudioTransportRecoveryError extends AppError {
  constructor(attempts: number, reason: string) {
    super(`Audio transport recovery failed after ${attempts} attempts: ${reason}`, 'ERR_AUDIO_TRANSPORT_RECOVERY', { attempts, reason });
    this.name = 'AudioTransportRecoveryError';
  }
}

export class AudioTransportTimeoutError extends AppError {
  constructor(timeoutMs: number) {
    super(`Audio transport operation timed out after ${timeoutMs}ms`, 'ERR_AUDIO_TRANSPORT_TIMEOUT', { timeoutMs });
    this.name = 'AudioTransportTimeoutError';
  }
}
