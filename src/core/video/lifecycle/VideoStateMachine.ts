import { VideoLifecycleState } from './LifecycleTypes';
import { LifecycleTransitionError } from '../../error/VideoLifecycleErrors';

export class VideoStateMachine {
  private static VALID_TRANSITIONS: Record<VideoLifecycleState, VideoLifecycleState[]> = {
    UNKNOWN: ['DISCOVERED', 'METADATA_LOADING', 'METADATA_READY', 'READY', 'DESTROYED'],
    DISCOVERED: ['METADATA_LOADING', 'METADATA_READY', 'READY', 'DESTROYED'],
    METADATA_LOADING: ['METADATA_READY', 'READY', 'UNKNOWN', 'DESTROYED'],
    METADATA_READY: ['READY', 'CAN_PLAY', 'PLAYING', 'PAUSED', 'DESTROYED'],
    READY: ['CAN_PLAY', 'PLAYING', 'PAUSED', 'WAITING', 'BUFFERING', 'DESTROYED'],
    CAN_PLAY: ['PLAYING', 'PAUSED', 'BUFFERING', 'WAITING', 'SEEKING', 'DESTROYED'],
    PLAYING: ['PAUSED', 'BUFFERING', 'WAITING', 'SEEKING', 'STALLED', 'ENDED', 'DESTROYED'],
    PAUSED: ['PLAYING', 'SEEKING', 'BUFFERING', 'WAITING', 'ENDED', 'DESTROYED'],
    BUFFERING: ['PLAYING', 'PAUSED', 'READY', 'CAN_PLAY', 'WAITING', 'STALLED', 'DESTROYED'],
    SEEKING: ['PLAYING', 'PAUSED', 'READY', 'CAN_PLAY', 'BUFFERING', 'DESTROYED'],
    WAITING: ['PLAYING', 'PAUSED', 'BUFFERING', 'CAN_PLAY', 'STALLED', 'DESTROYED'],
    STALLED: ['PLAYING', 'PAUSED', 'BUFFERING', 'WAITING', 'DESTROYED'],
    ENDED: ['PLAYING', 'PAUSED', 'SEEKING', 'DESTROYED'],
    DESTROYED: ['UNKNOWN', 'DISCOVERED']
  };

  canTransition(from: VideoLifecycleState, to: VideoLifecycleState): boolean {
    if (from === to) return true;
    const allowed = VideoStateMachine.VALID_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  transition(videoId: string, from: VideoLifecycleState, to: VideoLifecycleState): VideoLifecycleState {
    if (!this.canTransition(from, to)) {
      throw new LifecycleTransitionError(videoId, from, to);
    }
    return to;
  }
}
