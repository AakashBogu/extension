import { AppError } from './AppError';

export class VideoLifecycleError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_VIDEO_LIFECYCLE', details);
    this.name = 'VideoLifecycleError';
  }
}

export class LifecycleTransitionError extends AppError {
  constructor(videoId: string, from: string, to: string) {
    super(`Invalid video lifecycle transition for [${videoId}]: ${from} -> ${to}`, 'ERR_LIFECYCLE_TRANSITION', { videoId, from, to });
    this.name = 'LifecycleTransitionError';
  }
}

export class ListenerError extends AppError {
  constructor(videoId: string, eventName: string, reason: string) {
    super(`Failed to attach/detach listener for [${videoId}] on event [${eventName}]: ${reason}`, 'ERR_VIDEO_LISTENER', { videoId, eventName, reason });
    this.name = 'ListenerError';
  }
}
