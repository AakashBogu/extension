export interface TimeRange {
  start: number;
  end: number;
}

export interface PlaybackState {
  videoId: string;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  muted: boolean;
  paused: boolean;
  ended: boolean;
  loop: boolean;
  seeking: boolean;
  seekTarget?: number;
  bufferedRanges: TimeRange[];
  playedRanges: TimeRange[];
  videoWidth: number;
  videoHeight: number;
  isFullscreen: boolean;
  isPictureInPicture: boolean;
  timestamp: number;
}

export interface PlaybackSnapshot {
  id: string;
  videoId: string;
  timestamp: number;
  state: PlaybackState;
  timeDeltaMs: number;
  currentTimeDelta: number;
  progressPercent: number;
  sessionDurationMs: number;
}

export interface PlaybackMetrics {
  watchTimeSeconds: number;
  pauseCount: number;
  seekCount: number;
  avgPlaybackRate: number;
  bufferCount: number;
  bufferDurationMs: number;
  fullscreenTimeMs: number;
  pipTimeMs: number;
  volumeChangeCount: number;
}

export interface PlaybackConfig {
  trackingIntervalMs: number;
  snapshotFrequencyMs: number;
  metricsEnabled: boolean;
  historySize: number;
  progressEventIntervalMs: number;
}
