import { PlaybackState, PlaybackSnapshot } from './PlaybackTypes';

export class PlaybackSnapshotManager {
  private history = new Map<string, PlaybackSnapshot[]>();
  private sessionStartMap = new Map<string, number>();
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 50) {
    this.maxHistorySize = maxHistorySize;
  }

  createSnapshot(state: PlaybackState, previousSnapshot?: PlaybackSnapshot): PlaybackSnapshot {
    const videoId = state.videoId;
    if (!this.sessionStartMap.has(videoId)) {
      this.sessionStartMap.set(videoId, state.timestamp);
    }

    const sessionStart = this.sessionStartMap.get(videoId)!;
    const timeDeltaMs = previousSnapshot ? state.timestamp - previousSnapshot.timestamp : 0;
    const currentTimeDelta = previousSnapshot ? state.currentTime - previousSnapshot.state.currentTime : 0;
    const progressPercent = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

    const snapshot: PlaybackSnapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      videoId,
      timestamp: state.timestamp,
      state,
      timeDeltaMs,
      currentTimeDelta,
      progressPercent: Math.min(100, Math.max(0, progressPercent)),
      sessionDurationMs: state.timestamp - sessionStart
    };

    let videoHistory = this.history.get(videoId);
    if (!videoHistory) {
      videoHistory = [];
      this.history.set(videoId, videoHistory);
    }

    if (videoHistory.length >= this.maxHistorySize) {
      videoHistory.shift();
    }
    videoHistory.push(snapshot);

    return snapshot;
  }

  getSnapshots(videoId: string): PlaybackSnapshot[] {
    return this.history.get(videoId) || [];
  }

  getLatestSnapshot(videoId: string): PlaybackSnapshot | undefined {
    const list = this.history.get(videoId);
    return list && list.length > 0 ? list[list.length - 1] : undefined;
  }

  clear(videoId: string): void {
    this.history.delete(videoId);
    this.sessionStartMap.delete(videoId);
  }
}
