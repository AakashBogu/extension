import { describe, it, expect } from 'vitest';
import { PlaybackMetricsCollector } from '../core/video/playback/PlaybackMetricsCollector';
import { PlaybackState } from '../core/video/playback/PlaybackTypes';

describe('Module 2D: PlaybackMetricsCollector', () => {
  it('should accumulate watch time and count pause/seek events', () => {
    const collector = new PlaybackMetricsCollector();
    const now = Date.now();

    const state1: PlaybackState = {
      videoId: 'v20',
      currentTime: 0,
      duration: 60,
      playbackRate: 1.0,
      volume: 1.0,
      muted: false,
      paused: false,
      ended: false,
      loop: false,
      seeking: false,
      bufferedRanges: [],
      playedRanges: [],
      videoWidth: 640,
      videoHeight: 360,
      isFullscreen: false,
      isPictureInPicture: false,
      timestamp: now
    };

    collector.updateMetrics(state1);

    const state2: PlaybackState = {
      ...state1,
      currentTime: 5,
      timestamp: now + 5000
    };

    const metrics2 = collector.updateMetrics(state2);
    expect(metrics2.watchTimeSeconds).toBe(5);

    const state3: PlaybackState = {
      ...state2,
      paused: true,
      timestamp: now + 6000
    };

    const metrics3 = collector.updateMetrics(state3);
    expect(metrics3.pauseCount).toBe(1);
  });
});
