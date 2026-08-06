import { VideoCandidateFactors, CandidateScore, ScoringWeights } from './SelectionTypes';

export class VideoScoringEngine {
  private weights: ScoringWeights;

  constructor(customWeights?: Partial<ScoringWeights>) {
    this.weights = {
      playing: 30,
      visibility: 25,
      size: 15,
      fullscreen: 20,
      pip: 15,
      unmuted: 10,
      userInteraction: 15,
      focus: 10,
      ...customWeights
    };
  }

  calculateScore(factors: VideoCandidateFactors): CandidateScore {
    let score = 0;

    if (factors.isPlaying) score += this.weights.playing;
    score += factors.visibilityRatio * this.weights.visibility;

    const area = factors.width * factors.height;
    if (area > 0) {
      const normalizedSizeScore = Math.min(1.0, area / (1920 * 1080)) * this.weights.size;
      score += normalizedSizeScore;
    }

    if (factors.isFullscreen) score += this.weights.fullscreen;
    if (factors.isPictureInPicture) score += this.weights.pip;
    if (!factors.isMuted) score += this.weights.unmuted;
    if (factors.isFocused) score += this.weights.focus;

    if (factors.lastInteractedAt > 0) {
      const ageSeconds = (Date.now() - factors.lastInteractedAt) / 1000;
      if (ageSeconds < 60) {
        score += this.weights.userInteraction * (1 - ageSeconds / 60);
      }
    }

    return {
      videoId: factors.videoId,
      score: Math.round(score * 100) / 100,
      factors,
      calculatedAt: Date.now()
    };
  }
}
