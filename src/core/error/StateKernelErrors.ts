import { AppError } from './AppError';

export class StateValidationError extends AppError {
  constructor(sliceKey: string, reason: string) {
    super(`State validation failed for slice [${sliceKey}]: ${reason}`, 'ERR_STATE_VALIDATION', { sliceKey, reason });
    this.name = 'StateValidationError';
  }
}

export class SnapshotError extends AppError {
  constructor(reason: string) {
    super(`Snapshot operation failed: ${reason}`, 'ERR_SNAPSHOT');
    this.name = 'SnapshotError';
  }
}

export class PersistenceError extends AppError {
  constructor(reason: string) {
    super(`State persistence failed: ${reason}`, 'ERR_PERSISTENCE');
    this.name = 'PersistenceError';
  }
}

export class HydrationError extends AppError {
  constructor(reason: string) {
    super(`State hydration failed: ${reason}`, 'ERR_HYDRATION');
    this.name = 'HydrationError';
  }
}

export class SynchronizationError extends AppError {
  constructor(reason: string) {
    super(`State synchronization failed: ${reason}`, 'ERR_SYNCHRONIZATION');
    this.name = 'SynchronizationError';
  }
}
