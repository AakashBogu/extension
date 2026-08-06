import { describe, it, expect } from 'vitest';
import { BrowserCleanupManager } from '../core/browser/integration/BrowserCleanupManager';
import { VideoRegistry } from '../core/video/VideoRegistry';
import { PlaybackSnapshotManager } from '../core/video/playback/PlaybackSnapshotManager';

describe('Module 2F: BrowserCleanupManager', () => {
  it('should purge detached video registry records safely', () => {
    const registry = new VideoRegistry();
    const snapshotManager = new PlaybackSnapshotManager();
    const cleanupManager = new BrowserCleanupManager(registry, snapshotManager);

    const cleanedCount = cleanupManager.cleanupDetachedVideos();
    expect(cleanedCount).toBe(0);
  });
});
