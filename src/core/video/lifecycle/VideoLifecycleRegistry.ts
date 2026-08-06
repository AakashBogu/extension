import { VideoLifecycleState, VideoLifecycleEntry, LifecycleTransition } from './LifecycleTypes';

export class VideoLifecycleRegistry {
  private entries = new Map<string, VideoLifecycleEntry>();
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 20) {
    this.maxHistorySize = maxHistorySize;
  }

  registerVideoLifecycle(videoId: string, initialState: VideoLifecycleState = 'DISCOVERED'): VideoLifecycleEntry {
    const entry: VideoLifecycleEntry = {
      videoId,
      currentState: initialState,
      previousState: 'UNKNOWN',
      history: [],
      lastEvent: 'discovered'
    };
    this.entries.set(videoId, entry);
    return entry;
  }

  updateState(videoId: string, nextState: VideoLifecycleState, eventName: string): VideoLifecycleEntry {
    let entry = this.entries.get(videoId);
    if (!entry) {
      entry = this.registerVideoLifecycle(videoId, nextState);
    }

    const transition: LifecycleTransition = {
      from: entry.currentState,
      to: nextState,
      timestamp: Date.now(),
      eventName
    };

    if (entry.history.length >= this.maxHistorySize) {
      entry.history.shift();
    }
    entry.history.push(transition);

    entry.previousState = entry.currentState;
    entry.currentState = nextState;
    entry.lastEvent = eventName;

    return entry;
  }

  getLifecycleEntry(videoId: string): VideoLifecycleEntry | undefined {
    return this.entries.get(videoId);
  }

  unregisterVideo(videoId: string): void {
    const entry = this.entries.get(videoId);
    if (entry) {
      entry.currentState = 'DESTROYED';
      this.entries.delete(videoId);
    }
  }

  listEntries(): VideoLifecycleEntry[] {
    return Array.from(this.entries.values());
  }

  clear(): void {
    this.entries.clear();
  }
}
