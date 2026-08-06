import { VideoRegistry } from '../../video/VideoRegistry';
import { PlaybackSnapshotManager } from '../../video/playback/PlaybackSnapshotManager';

export class BrowserCleanupManager {
  constructor(
    private videoRegistry: VideoRegistry,
    private snapshotManager: PlaybackSnapshotManager
  ) {}

  cleanupDetachedVideos(): number {
    const videos = this.videoRegistry.listVideos();
    let cleaned = 0;

    videos.forEach(video => {
      // Clean up orphaned entries
      if (!video.src && video.readyState === 0) {
        this.videoRegistry.unregisterVideo(video.id);
        this.snapshotManager.clear(video.id);
        cleaned++;
      }
    });

    return cleaned;
  }
}
