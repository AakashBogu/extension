import { PlaybackState, PlaybackMetrics } from './PlaybackTypes';

export class PlaybackMetricsCollector {
  private metricsMap = new Map<string, PlaybackMetrics>();
  private lastStateMap = new Map<string, PlaybackState>();

  updateMetrics(currentState: PlaybackState): PlaybackMetrics {
    const videoId = currentState.videoId;
    let metrics = this.metricsMap.get(videoId);
    if (!metrics) {
      metrics = {
        watchTimeSeconds: 0,
        pauseCount: 0,
        seekCount: 0,
        avgPlaybackRate: currentState.playbackRate,
        bufferCount: 0,
        bufferDurationMs: 0,
        fullscreenTimeMs: 0,
        pipTimeMs: 0,
        volumeChangeCount: 0
      };
      this.metricsMap.set(videoId, metrics);
    }

    const prevState = this.lastStateMap.get(videoId);
    if (prevState) {
      const deltaMs = currentState.timestamp - prevState.timestamp;

      if (!prevState.paused && !currentState.paused) {
        metrics.watchTimeSeconds += deltaMs / 1000;
      }
      if (!prevState.paused && currentState.paused) {
        metrics.pauseCount++;
      }
      if (prevState.seeking !== currentState.seeking && currentState.seeking) {
        metrics.seekCount++;
      }
      if (prevState.volume !== currentState.volume || prevState.muted !== currentState.muted) {
        metrics.volumeChangeCount++;
      }
      if (prevState.isFullscreen && currentState.isFullscreen) {
        metrics.fullscreenTimeMs += deltaMs;
      }
      if (prevState.isPictureInPicture && currentState.isPictureInPicture) {
        metrics.pipTimeMs += deltaMs;
      }
    }

    this.lastStateMap.set(videoId, currentState);
    return { ...metrics };
  }

  getMetrics(videoId: string): PlaybackMetrics | undefined {
    const m = this.metricsMap.get(videoId);
    return m ? { ...m } : undefined;
  }

  clear(videoId: string): void {
    this.metricsMap.delete(videoId);
    this.lastStateMap.delete(videoId);
  }
}
