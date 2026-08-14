import { AppError } from './AppError';

export class OffscreenRuntimeError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_OFFSCREEN_RUNTIME', details);
    this.name = 'OffscreenRuntimeError';
  }
}

export class OffscreenCreationError extends AppError {
  constructor(reason: string) {
    super(`Failed to create offscreen document: ${reason}`, 'ERR_OFFSCREEN_CREATION', { reason });
    this.name = 'OffscreenCreationError';
  }
}

export class OffscreenInitializationError extends AppError {
  constructor(reason: string) {
    super(`Failed to initialize offscreen runtime: ${reason}`, 'ERR_OFFSCREEN_INIT', { reason });
    this.name = 'OffscreenInitializationError';
  }
}

export class OffscreenMessageError extends AppError {
  constructor(messageId: string, reason: string) {
    super(`Offscreen messaging error [${messageId}]: ${reason}`, 'ERR_OFFSCREEN_MESSAGE', { messageId, reason });
    this.name = 'OffscreenMessageError';
  }
}

export class OffscreenCapabilityError extends AppError {
  constructor(capability: string) {
    super(`Offscreen capability unavailable: [${capability}]`, 'ERR_OFFSCREEN_CAPABILITY', { capability });
    this.name = 'OffscreenCapabilityError';
  }
}

export class OffscreenRecoveryError extends AppError {
  constructor(attempts: number, reason: string) {
    super(`Offscreen recovery failed after ${attempts} attempts: ${reason}`, 'ERR_OFFSCREEN_RECOVERY', { attempts, reason });
    this.name = 'OffscreenRecoveryError';
  }
}

export class AudioContextRuntimeError extends AppError {
  constructor(reason: string) {
    super(`AudioContext runtime error: ${reason}`, 'ERR_AUDIOCONTEXT_RUNTIME', { reason });
    this.name = 'AudioContextRuntimeError';
  }
}
