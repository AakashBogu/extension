export interface ScoringWeights {
  playing: number;
  visibility: number;
  size: number;
  fullscreen: number;
  pip: number;
  unmuted: number;
  userInteraction: number;
  focus: number;
}

export interface VideoCandidateFactors {
  videoId: string;
  isPlaying: boolean;
  visibilityRatio: number;
  width: number;
  height: number;
  isFullscreen: boolean;
  isPictureInPicture: boolean;
  isMuted: boolean;
  isFocused: boolean;
  lastInteractedAt: number;
}

export interface CandidateScore {
  videoId: string;
  score: number;
  factors: VideoCandidateFactors;
  calculatedAt: number;
}

export interface SelectionConfig {
  scoreWeights: ScoringWeights;
  selectionDebounceMs: number;
  viewportThreshold: number;
  pinnedVideoTimeoutMs: number;
  autoSelectionEnabled: boolean;
}
