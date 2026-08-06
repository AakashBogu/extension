import { VideoLifecycleState } from './LifecycleTypes';

export class VideoStateResolver {
  resolveStateFromEvent(eventName: string): VideoLifecycleState | null {
    switch (eventName) {
      case 'loadstart':
        return 'METADATA_LOADING';
      case 'loadedmetadata':
        return 'METADATA_READY';
      case 'loadeddata':
        return 'READY';
      case 'canplay':
      case 'canplaythrough':
        return 'CAN_PLAY';
      case 'play':
      case 'playing':
        return 'PLAYING';
      case 'pause':
        return 'PAUSED';
      case 'waiting':
        return 'WAITING';
      case 'seeking':
      case 'seeked':
        return 'SEEKING';
      case 'stalled':
        return 'STALLED';
      case 'ended':
        return 'ENDED';
      case 'emptied':
      case 'abort':
      case 'error':
        return 'UNKNOWN';
      default:
        return null;
    }
  }
}
