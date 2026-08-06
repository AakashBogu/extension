import { PlaybackState, TimeRange } from './PlaybackTypes';

export class PlaybackStateResolver {
  resolvePlaybackState(videoId: string, videoEl: HTMLVideoElement): PlaybackState {
    const bufferedRanges: TimeRange[] = [];
    if (videoEl.buffered) {
      for (let i = 0; i < videoEl.buffered.length; i++) {
        bufferedRanges.push({
          start: videoEl.buffered.start(i),
          end: videoEl.buffered.end(i)
        });
      }
    }

    const playedRanges: TimeRange[] = [];
    if (videoEl.played) {
      for (let i = 0; i < videoEl.played.length; i++) {
        playedRanges.push({
          start: videoEl.played.start(i),
          end: videoEl.played.end(i)
        });
      }
    }

    const doc = typeof document !== 'undefined' ? (document as Document & { pictureInPictureElement?: Element }) : null;

    return {
      videoId,
      currentTime: videoEl.currentTime || 0,
      duration: isNaN(videoEl.duration) ? 0 : videoEl.duration,
      playbackRate: videoEl.playbackRate || 1.0,
      volume: videoEl.volume !== undefined ? videoEl.volume : 1.0,
      muted: videoEl.muted || false,
      paused: videoEl.paused !== undefined ? videoEl.paused : true,
      ended: videoEl.ended || false,
      loop: videoEl.loop || false,
      seeking: videoEl.seeking || false,
      bufferedRanges,
      playedRanges,
      videoWidth: videoEl.videoWidth || videoEl.width || 0,
      videoHeight: videoEl.videoHeight || videoEl.height || 0,
      isFullscreen: doc ? doc.fullscreenElement === videoEl : false,
      isPictureInPicture: doc ? doc.pictureInPictureElement === videoEl : false,
      timestamp: Date.now()
    };
  }
}
