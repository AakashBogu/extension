import { AppError } from './AppError';

export class ActiveVideoError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_ACTIVE_VIDEO', details);
    this.name = 'ActiveVideoError';
  }
}

export class VideoSelectionError extends AppError {
  constructor(reason: string) {
    super(`Active video selection failed: ${reason}`, 'ERR_VIDEO_SELECTION');
    this.name = 'VideoSelectionError';
  }
}

export class ScoringError extends AppError {
  constructor(videoId: string, reason: string) {
    super(`Scoring failed for video [${videoId}]: ${reason}`, 'ERR_SCORING', { videoId, reason });
    this.name = 'ScoringError';
  }
}

export class VisibilityTrackingError extends AppError {
  constructor(videoId: string, reason: string) {
    super(`Visibility tracking error for video [${videoId}]: ${reason}`, 'ERR_VISIBILITY_TRACKING', { videoId, reason });
    this.name = 'VisibilityTrackingError';
  }
}
