import { VideoScoringEngine } from './VideoScoringEngine';
import { ActiveVideoSelector } from './ActiveVideoSelector';
import { VisibilityTracker } from './VisibilityTracker';
import { FocusTracker } from './FocusTracker';
import { InteractionTracker } from './InteractionTracker';
import { VideoCandidateFactors, CandidateScore, SelectionConfig } from './SelectionTypes';
import { IEventBus } from '../../events/IEventBus';
import { GlobalStateStore } from '../../state/GlobalStateStore';

export class ActiveVideoManager {
  public readonly scoringEngine: VideoScoringEngine;
  public readonly selector: ActiveVideoSelector;
  public readonly visibilityTracker: VisibilityTracker;
  public readonly focusTracker: FocusTracker;
  public readonly interactionTracker: InteractionTracker;
  private candidateMap = new Map<string, VideoCandidateFactors>();
  private activeVideoId: string | null = null;
  private config: SelectionConfig;
  private eventBus?: IEventBus;

  constructor(eventBus?: IEventBus, stateStore?: GlobalStateStore, config?: Partial<SelectionConfig>) {
    this.config = {
      scoreWeights: {
        playing: 30, visibility: 25, size: 15, fullscreen: 20,
        pip: 15, unmuted: 10, userInteraction: 15, focus: 10
      },
      selectionDebounceMs: 200,
      viewportThreshold: 0.25,
      pinnedVideoTimeoutMs: 300000,
      autoSelectionEnabled: true,
      ...config
    };

    this.eventBus = eventBus;
    this.scoringEngine = new VideoScoringEngine(this.config.scoreWeights);
    this.selector = new ActiveVideoSelector();
    this.visibilityTracker = new VisibilityTracker();
    this.focusTracker = new FocusTracker();
    this.interactionTracker = new InteractionTracker();

    if (stateStore) {
      this.syncState(stateStore);
    }
  }

  addCandidate(videoId: string, factors: Partial<VideoCandidateFactors>): void {
    const fullFactors: VideoCandidateFactors = {
      videoId,
      isPlaying: false,
      visibilityRatio: 1.0,
      width: 640,
      height: 360,
      isFullscreen: false,
      isPictureInPicture: false,
      isMuted: false,
      isFocused: false,
      lastInteractedAt: 0,
      ...factors
    };
    this.candidateMap.set(videoId, fullFactors);

    if (this.eventBus) {
      this.eventBus.publish('video.candidate_added', { videoId });
    }

    this.evaluateActiveVideo();
  }

  removeCandidate(videoId: string): void {
    this.candidateMap.delete(videoId);

    if (this.eventBus) {
      this.eventBus.publish('video.candidate_removed', { videoId });
    }

    if (this.activeVideoId === videoId) {
      this.activeVideoId = null;
      if (this.eventBus) {
        this.eventBus.publish('active_video.lost', { videoId });
      }
      this.evaluateActiveVideo();
    }
  }

  updateCandidateFactors(videoId: string, updates: Partial<VideoCandidateFactors>): void {
    const existing = this.candidateMap.get(videoId);
    if (existing) {
      this.candidateMap.set(videoId, { ...existing, ...updates });
      this.evaluateActiveVideo();
    }
  }

  evaluateActiveVideo(): string | null {
    if (!this.config.autoSelectionEnabled) return this.activeVideoId;

    const scores: CandidateScore[] = [];
    this.candidateMap.forEach(factors => {
      scores.push(this.scoringEngine.calculateScore(factors));
    });

    const best = this.selector.selectBestCandidate(scores);
    const previousActive = this.activeVideoId;

    if (best && best.videoId !== previousActive) {
      this.activeVideoId = best.videoId;
      if (this.eventBus) {
        this.eventBus.publish('active_video.changed', {
          previousActiveVideoId: previousActive,
          activeVideoId: best.videoId,
          score: best.score
        });
        this.eventBus.publish('active_video.selected', best);
      }
    }

    return this.activeVideoId;
  }

  getActiveVideoId(): string | null {
    return this.activeVideoId;
  }

  private syncState(stateStore: GlobalStateStore): void {
    stateStore.subscribe(() => {
      // Sync activeVideoId slice
    });
  }
}
