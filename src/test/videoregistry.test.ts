import { describe, it, expect, beforeEach } from 'vitest';
import { VideoRegistry } from '../core/video/VideoRegistry';
import { DiscoveredVideoMetadata } from '../core/video/VideoTypes';
import { EventBus } from '../core/events/EventBus';

describe('Module 2B: VideoRegistry', () => {
  let registry: VideoRegistry;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    registry = new VideoRegistry(5, eventBus);
  });

  it('should register video and maintain active candidate selection', () => {
    const mockVideoEl = { src: 'v1.mp4' } as HTMLVideoElement;
    const meta: DiscoveredVideoMetadata = {
      id: 'vid_1',
      src: 'v1.mp4',
      currentSrc: 'v1.mp4',
      poster: '',
      width: 640,
      height: 360,
      readyState: 4,
      networkState: 1,
      preload: 'auto',
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      crossOrigin: null,
      discoveredAt: Date.now(),
      isShadowDom: false
    };

    const id = registry.registerVideo(mockVideoEl, meta);
    expect(id).toBe('vid_1');
    expect(registry.getActiveVideo()?.id).toBe('vid_1');
    expect(registry.size()).toBe(1);
  });

  it('should unregister videos and update active candidate when removed', () => {
    const mockVideo1 = { src: 'v1.mp4' } as HTMLVideoElement;
    const mockVideo2 = { src: 'v2.mp4' } as HTMLVideoElement;

    const createMeta = (id: string, src: string): DiscoveredVideoMetadata => ({
      id,
      src,
      currentSrc: src,
      poster: '',
      width: 640,
      height: 360,
      readyState: 4,
      networkState: 1,
      preload: 'auto',
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      crossOrigin: null,
      discoveredAt: Date.now(),
      isShadowDom: false
    });

    const meta1 = createMeta('v1', 'v1.mp4');
    const meta2 = createMeta('v2', 'v2.mp4');

    registry.registerVideo(mockVideo1, meta1);
    registry.registerVideo(mockVideo2, meta2);

    registry.unregisterVideo('v1');
    expect(registry.size()).toBe(1);
    expect(registry.getActiveVideo()?.id).toBe('v2');
  });
});
