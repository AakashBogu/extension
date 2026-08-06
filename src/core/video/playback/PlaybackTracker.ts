export type PlaybackEventCallback = (videoId: string, eventName: string, event: Event) => void;

export class PlaybackTracker {
  private listenerMap = new Map<HTMLVideoElement, Map<string, EventListener>>();

  private static TRACKED_EVENTS = [
    'timeupdate', 'ratechange', 'volumechange', 'durationchange',
    'progress', 'seeking', 'seeked', 'waiting', 'playing',
    'pause', 'ended', 'stalled', 'resize',
    'enterpictureinpicture', 'leavepictureinpicture', 'fullscreenchange'
  ];

  attachTracker(videoId: string, videoEl: HTMLVideoElement, callback: PlaybackEventCallback): void {
    if (!videoEl || typeof videoEl.addEventListener !== 'function') return;

    if (this.listenerMap.has(videoEl)) {
      this.detachTracker(videoId, videoEl);
    }

    const eventListeners = new Map<string, EventListener>();

    PlaybackTracker.TRACKED_EVENTS.forEach(eventName => {
      const handler: EventListener = (evt: Event) => {
        callback(videoId, eventName, evt);
      };
      videoEl.addEventListener(eventName, handler);
      eventListeners.set(eventName, handler);
    });

    this.listenerMap.set(videoEl, eventListeners);
  }

  detachTracker(_videoId: string, videoEl: HTMLVideoElement): void {
    const eventListeners = this.listenerMap.get(videoEl);
    if (!eventListeners || !videoEl || typeof videoEl.removeEventListener !== 'function') return;

    eventListeners.forEach((handler, eventName) => {
      videoEl.removeEventListener(eventName, handler);
    });
    this.listenerMap.delete(videoEl);
  }
}
