import { describe, it, expect } from 'vitest';
import { PlaybackSnapshotManager } from '../core/video/playback/PlaybackSnapshotManager';
import { PlaybackState } from '../core/video/playback/PlaybackTypes';

describe('Module 2D: PlaybackSnapshotManager', () => {
  it('should compute time deltas and progress percentage correctly', () => {
    const manager = new PlaybackSnapshotManager(10);
    const now = Date.now();

    const state1: PlaybackState = {
      videoId: 'v10',
      currentTime: 10,
      duration: 100,
      playbackRate: 1.0,
      volume: 1.0,
      muted: false,
      paused: false,
      ended: false,
      loop: false,
      seeking: false,
      bufferedRanges: [],
      playedRanges: [],
      videoWidth: 1280,
      videoHeight: 720,
      isFullscreen: false,
      isPictureInPicture: false,
      timestamp: now
    };

    const snap1 = manager.createSnapshot(state1);
    expect(snap1.progressPercent).toBe(10);

    const state2: PlaybackState = {
      ...state1,
      currentTime: 25,
      timestamp: now + 1000
    };

    const snap2 = manager.createSnapshot(state2, snap1);
    expect(snap2.progressPercent).toBe(25);
    expect(snap2.currentTimeDelta).toBe(15);
    expect(snap2.timeDeltaMs).toBe(1000);
  });
});
