import { describe, it, expect, beforeEach } from 'vitest';
import { VideoDiscoveryEngine } from '../core/video/VideoDiscoveryEngine';
import { EventBus } from '../core/events/EventBus';

describe('Module 2B: Video Discovery Engine & Scanner', () => {
  let engine: VideoDiscoveryEngine;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    engine = new VideoDiscoveryEngine(eventBus);
  });

  it('should extract static video metadata from video element mock', () => {
    const mockVideoEl = {
      src: 'https://sample.com/video.mp4',
      currentSrc: 'https://sample.com/video.mp4',
      poster: 'https://sample.com/poster.jpg',
      width: 1280,
      height: 720,
      readyState: 4,
      networkState: 1,
      preload: 'auto',
      autoplay: true,
      loop: false,
      muted: true,
      controls: true,
      crossOrigin: 'anonymous'
    } as unknown as HTMLVideoElement;

    const meta = engine.extractor.extractMetadata(mockVideoEl);
    expect(meta.src).toBe('https://sample.com/video.mp4');
    expect(meta.width).toBe(1280);
    expect(meta.autoplay).toBe(true);
    expect(meta.id).toBeDefined();
  });
});
