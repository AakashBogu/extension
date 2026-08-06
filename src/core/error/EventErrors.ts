import { AppError } from './AppError';

export class EventDispatchError extends AppError {
  constructor(topic: string, reason: string, details?: Record<string, unknown>) {
    super(`Failed to dispatch event [${topic}]: ${reason}`, 'ERR_EVENT_DISPATCH', details);
    this.name = 'EventDispatchError';
  }
}

export class UnknownEventError extends AppError {
  constructor(topic: string) {
    super(`Unknown event topic [${topic}]`, 'ERR_UNKNOWN_EVENT', { topic });
    this.name = 'UnknownEventError';
  }
}

export class HandlerTimeoutError extends AppError {
  constructor(topic: string, timeoutMs: number) {
    super(`Event handler for [${topic}] timed out after ${timeoutMs}ms`, 'ERR_HANDLER_TIMEOUT', { topic, timeoutMs });
    this.name = 'HandlerTimeoutError';
  }
}

export class MessageSerializationError extends AppError {
  constructor(reason: string) {
    super(`Message serialization failed: ${reason}`, 'ERR_MESSAGE_SERIALIZATION');
    this.name = 'MessageSerializationError';
  }
}
