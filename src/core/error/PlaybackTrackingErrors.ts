import { AppError } from './AppError';

export class PlaybackTrackingError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_PLAYBACK_TRACKING', details);
    this.name = 'PlaybackTrackingError';
  }
}

export class PlaybackSnapshotError extends AppError {
  constructor(videoId: string, reason: string) {
    super(`Playback snapshot failed for [${videoId}]: ${reason}`, 'ERR_PLAYBACK_SNAPSHOT', { videoId, reason });
    this.name = 'PlaybackSnapshotError';
  }
}

export class PlaybackMetricsError extends AppError {
  constructor(videoId: string, reason: string) {
    super(`Playback metrics calculation failed for [${videoId}]: ${reason}`, 'ERR_PLAYBACK_METRICS', { videoId, reason });
    this.name = 'PlaybackMetricsError';
  }
}
