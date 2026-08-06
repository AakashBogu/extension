import { VideoStateMachine } from './VideoStateMachine';
import { VideoStateResolver } from './VideoStateResolver';
import { VideoLifecycleRegistry } from './VideoLifecycleRegistry';
import { VideoLifecycleObserver } from './VideoLifecycleObserver';
import { LifecycleConfig } from './LifecycleTypes';
import { IEventBus } from '../../events/IEventBus';
import { GlobalStateStore } from '../../state/GlobalStateStore';

export class VideoLifecycleManager {
  public readonly stateMachine: VideoStateMachine;
  public readonly resolver: VideoStateResolver;
  public readonly registry: VideoLifecycleRegistry;
  public readonly observer: VideoLifecycleObserver;
  private config: LifecycleConfig;
  private eventBus?: IEventBus;

  constructor(eventBus?: IEventBus, stateStore?: GlobalStateStore, config?: Partial<LifecycleConfig>) {
    this.config = {
      validateTransitions: true,
      maxHistorySize: 20,
      enableLifecycleLogging: true,
      ...config
    };

    this.eventBus = eventBus;
    this.stateMachine = new VideoStateMachine();
    this.resolver = new VideoStateResolver();
    this.registry = new VideoLifecycleRegistry(this.config.maxHistorySize);
    this.observer = new VideoLifecycleObserver();

    if (stateStore) {
      this.syncState(stateStore);
    }
  }

  attachVideo(videoId: string, videoEl: HTMLVideoElement): void {
    this.registry.registerVideoLifecycle(videoId, 'DISCOVERED');

    this.observer.attachListeners(videoId, videoEl, (vId, eventName, _evt) => {
      this.handleVideoEvent(vId, eventName);
    });
  }

  detachVideo(videoId: string, videoEl: HTMLVideoElement): void {
    this.observer.detachListeners(videoId, videoEl);
    this.registry.unregisterVideo(videoId);

    if (this.eventBus) {
      this.eventBus.publish('video.destroyed', { videoId });
    }
  }

  handleVideoEvent(videoId: string, eventName: string): void {
    const targetState = this.resolver.resolveStateFromEvent(eventName);
    if (!targetState) return;

    const entry = this.registry.getLifecycleEntry(videoId);
    const currentState = entry ? entry.currentState : 'UNKNOWN';

    if (this.config.validateTransitions) {
      if (!this.stateMachine.canTransition(currentState, targetState)) {
        return; // Ignore invalid transitions safely
      }
    }

    const updated = this.registry.updateState(videoId, targetState, eventName);

    if (this.eventBus) {
      this.eventBus.publish('video.state_changed', updated);

      if (targetState === 'READY' || targetState === 'CAN_PLAY') {
        this.eventBus.publish('video.ready', { videoId });
      } else if (targetState === 'PLAYING') {
        this.eventBus.publish('video.playing', { videoId });
      } else if (targetState === 'PAUSED') {
        this.eventBus.publish('video.paused', { videoId });
      } else if (targetState === 'BUFFERING') {
        this.eventBus.publish('video.buffering', { videoId });
      } else if (targetState === 'WAITING') {
        this.eventBus.publish('video.waiting', { videoId });
      } else if (targetState === 'STALLED') {
        this.eventBus.publish('video.stalled', { videoId });
      } else if (targetState === 'ENDED') {
        this.eventBus.publish('video.ended', { videoId });
      }
    }
  }

  private syncState(_stateStore: GlobalStateStore): void {
    // State sync hook
  }
}
