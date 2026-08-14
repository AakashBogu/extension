import { AppError } from './AppError';

export class TabAudioCaptureError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_TAB_AUDIO_CAPTURE', details);
    this.name = 'TabAudioCaptureError';
  }
}

export class TabCapturePermissionError extends AppError {
  constructor(reason: string) {
    super(`Tab capture permission denied: ${reason}`, 'ERR_TAB_CAPTURE_PERMISSION', { reason });
    this.name = 'TabCapturePermissionError';
  }
}

export class TabCaptureCapabilityError extends AppError {
  constructor(capability: string) {
    super(`Tab capture capability unavailable: [${capability}]`, 'ERR_TAB_CAPTURE_CAPABILITY', { capability });
    this.name = 'TabCaptureCapabilityError';
  }
}

export class TabCaptureSessionError extends AppError {
  constructor(sessionId: string, reason: string) {
    super(`Capture session error [${sessionId}]: ${reason}`, 'ERR_TAB_CAPTURE_SESSION', { sessionId, reason });
    this.name = 'TabCaptureSessionError';
  }
}

export class TabCaptureStreamError extends AppError {
  constructor(reason: string) {
    super(`MediaStream audio track error: ${reason}`, 'ERR_TAB_CAPTURE_STREAM', { reason });
    this.name = 'TabCaptureStreamError';
  }
}

export class TabCaptureValidationError extends AppError {
  constructor(rule: string, reason: string) {
    super(`Tab capture validation failed for [${rule}]: ${reason}`, 'ERR_TAB_CAPTURE_VALIDATION', { rule, reason });
    this.name = 'TabCaptureValidationError';
  }
}

export class TabCaptureRecoveryError extends AppError {
  constructor(attempts: number, reason: string) {
    super(`Tab capture recovery failed after ${attempts} attempts: ${reason}`, 'ERR_TAB_CAPTURE_RECOVERY', { attempts, reason });
    this.name = 'TabCaptureRecoveryError';
  }
}

export class TabCaptureTimeoutError extends AppError {
  constructor(timeoutMs: number) {
    super(`Tab capture operation timed out after ${timeoutMs}ms`, 'ERR_TAB_CAPTURE_TIMEOUT', { timeoutMs });
    this.name = 'TabCaptureTimeoutError';
  }
}
