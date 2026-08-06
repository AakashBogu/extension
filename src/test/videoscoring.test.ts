import { describe, it, expect } from 'vitest';
import { VideoScoringEngine } from '../core/video/selection/VideoScoringEngine';
import { VideoCandidateFactors } from '../core/video/selection/SelectionTypes';

describe('Module 2E: VideoScoringEngine', () => {
  it('should calculate higher scores for playing, visible, and fullscreen videos', () => {
    const engine = new VideoScoringEngine();

    const candidate1: VideoCandidateFactors = {
      videoId: 'v1',
      isPlaying: true,
      visibilityRatio: 1.0,
      width: 1920,
      height: 1080,
      isFullscreen: true,
      isPictureInPicture: false,
      isMuted: false,
      isFocused: true,
      lastInteractedAt: Date.now()
    };

    const candidate2: VideoCandidateFactors = {
      videoId: 'v2',
      isPlaying: false,
      visibilityRatio: 0.1,
      width: 320,
      height: 180,
      isFullscreen: false,
      isPictureInPicture: false,
      isMuted: true,
      isFocused: false,
      lastInteractedAt: 0
    };

    const score1 = engine.calculateScore(candidate1);
    const score2 = engine.calculateScore(candidate2);

    expect(score1.score).toBeGreaterThan(score2.score);
    expect(score1.score).toBeGreaterThan(100);
  });
});
