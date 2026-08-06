import { ListenerError } from '../../error/VideoLifecycleErrors';

export type VideoEventCallback = (videoId: string, eventName: string, event: Event) => void;

export class VideoLifecycleObserver {
  private listenerMap = new Map<HTMLVideoElement, Map<string, EventListener>>();

  private static OBSERVED_EVENTS = [
    'loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough',
    'play', 'playing', 'pause', 'waiting', 'seeking', 'seeked',
    'stalled', 'ended', 'emptied', 'error', 'abort', 'suspend',
    'durationchange', 'resize'
  ];

  attachListeners(videoId: string, videoEl: HTMLVideoElement, callback: VideoEventCallback): void {
    if (!videoEl || typeof videoEl.addEventListener !== 'function') return;

    if (this.listenerMap.has(videoEl)) {
      this.detachListeners(videoId, videoEl);
    }

    const eventListeners = new Map<string, EventListener>();

    try {
      VideoLifecycleObserver.OBSERVED_EVENTS.forEach(eventName => {
        const handler: EventListener = (evt: Event) => {
          callback(videoId, eventName, evt);
        };
        videoEl.addEventListener(eventName, handler);
        eventListeners.set(eventName, handler);
      });

      this.listenerMap.set(videoEl, eventListeners);
    } catch (err) {
      throw new ListenerError(videoId, 'all', err instanceof Error ? err.message : String(err));
    }
  }

  detachListeners(videoId: string, videoEl: HTMLVideoElement): void {
    const eventListeners = this.listenerMap.get(videoEl);
    if (!eventListeners || !videoEl || typeof videoEl.removeEventListener !== 'function') return;

    try {
      eventListeners.forEach((handler, eventName) => {
        videoEl.removeEventListener(eventName, handler);
      });
      this.listenerMap.delete(videoEl);
    } catch (err) {
      throw new ListenerError(videoId, 'all', err instanceof Error ? err.message : String(err));
    }
  }
}
