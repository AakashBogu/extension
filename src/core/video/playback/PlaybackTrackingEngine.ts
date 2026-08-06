import { PlaybackTracker } from './PlaybackTracker';
import { PlaybackRegistry } from './PlaybackRegistry';
import { PlaybackSnapshotManager } from './PlaybackSnapshotManager';
import { PlaybackMetricsCollector } from './PlaybackMetricsCollector';
import { PlaybackStateResolver } from './PlaybackStateResolver';
import { PlaybackConfig } from './PlaybackTypes';
import { IEventBus } from '../../events/IEventBus';
import { GlobalStateStore } from '../../state/GlobalStateStore';

export class PlaybackTrackingEngine {
  public readonly tracker: PlaybackTracker;
  public readonly registry: PlaybackRegistry;
  public readonly snapshotManager: PlaybackSnapshotManager;
  public readonly metricsCollector: PlaybackMetricsCollector;
  public readonly resolver: PlaybackStateResolver;
  private config: PlaybackConfig;
  private eventBus?: IEventBus;

  constructor(eventBus?: IEventBus, _stateStore?: GlobalStateStore, config?: Partial<PlaybackConfig>) {
    this.config = {
      trackingIntervalMs: 250,
      snapshotFrequencyMs: 1000,
      metricsEnabled: true,
      historySize: 50,
      progressEventIntervalMs: 1000,
      ...config
    };

    this.eventBus = eventBus;
    this.tracker = new PlaybackTracker();
    this.registry = new PlaybackRegistry();
    this.snapshotManager = new PlaybackSnapshotManager(this.config.historySize);
    this.metricsCollector = new PlaybackMetricsCollector();
    this.resolver = new PlaybackStateResolver();
  }

  startTracking(videoId: string, videoEl: HTMLVideoElement): void {
    this.tracker.attachTracker(videoId, videoEl, (vId, eventName, _evt) => {
      this.handlePlaybackEvent(vId, videoEl, eventName);
    });
  }

  stopTracking(videoId: string, videoEl: HTMLVideoElement): void {
    this.tracker.detachTracker(videoId, videoEl);
    this.registry.removeRecord(videoId);
    this.snapshotManager.clear(videoId);
    this.metricsCollector.clear(videoId);
  }

  handlePlaybackEvent(videoId: string, videoEl: HTMLVideoElement, eventName: string): void {
    const currentState = this.resolver.resolvePlaybackState(videoId, videoEl);
    const prevSnapshot = this.snapshotManager.getLatestSnapshot(videoId);
    const snapshot = this.snapshotManager.createSnapshot(currentState, prevSnapshot);
    const metrics = this.metricsCollector.updateMetrics(currentState);

    const record = this.registry.updateRecord(videoId, currentState, snapshot, metrics);

    if (this.eventBus) {
      this.eventBus.publish('playback.updated', record);

      switch (eventName) {
        case 'playing':
          this.eventBus.publish('playback.started', record);
          break;
        case 'pause':
          this.eventBus.publish('playback.paused', record);
          break;
        case 'seeking':
          this.eventBus.publish('playback.seek_started', record);
          break;
        case 'seeked':
          this.eventBus.publish('playback.seek_completed', record);
          break;
        case 'ratechange':
          this.eventBus.publish('playback.rate_changed', record);
          break;
        case 'volumechange':
          this.eventBus.publish('playback.volume_changed', record);
          break;
        case 'timeupdate':
          this.eventBus.publish('playback.progress', record);
          break;
        case 'waiting':
        case 'stalled':
          this.eventBus.publish('playback.buffering', record);
          break;
        case 'ended':
          this.eventBus.publish('playback.ended', record);
          break;
        case 'fullscreenchange':
          this.eventBus.publish('playback.fullscreen_changed', record);
          break;
        case 'enterpictureinpicture':
        case 'leavepictureinpicture':
          this.eventBus.publish('playback.pip_changed', record);
          break;
      }
    }
  }
}
