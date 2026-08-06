import { PlaybackState, PlaybackSnapshot, PlaybackMetrics } from './PlaybackTypes';

export interface VideoPlaybackRecord {
  videoId: string;
  latestState: PlaybackState;
  previousState?: PlaybackState;
  latestSnapshot: PlaybackSnapshot;
  metrics: PlaybackMetrics;
  sessionStartedAt: number;
  lastActivityAt: number;
}

export class PlaybackRegistry {
  private records = new Map<string, VideoPlaybackRecord>();

  updateRecord(videoId: string, state: PlaybackState, snapshot: PlaybackSnapshot, metrics: PlaybackMetrics): VideoPlaybackRecord {
    const existing = this.records.get(videoId);
    const record: VideoPlaybackRecord = {
      videoId,
      latestState: state,
      previousState: existing ? existing.latestState : undefined,
      latestSnapshot: snapshot,
      metrics,
      sessionStartedAt: existing ? existing.sessionStartedAt : state.timestamp,
      lastActivityAt: state.timestamp
    };
    this.records.set(videoId, record);
    return record;
  }

  getRecord(videoId: string): VideoPlaybackRecord | undefined {
    return this.records.get(videoId);
  }

  removeRecord(videoId: string): void {
    this.records.delete(videoId);
  }

  listRecords(): VideoPlaybackRecord[] {
    return Array.from(this.records.values());
  }

  clear(): void {
    this.records.clear();
  }
}
