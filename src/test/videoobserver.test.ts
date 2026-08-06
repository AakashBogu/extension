import { describe, it, expect } from 'vitest';
import { VideoObserver } from '../core/video/VideoObserver';
import { VideoLocator } from '../core/video/VideoLocator';

describe('Module 2B: VideoObserver & VideoLocator', () => {
  it('should initialize VideoLocator cleanly', () => {
    const locator = new VideoLocator();
    const videos = locator.locateVideos();
    expect(Array.isArray(videos)).toBe(true);
  });

  it('should start and stop VideoObserver cleanly', () => {
    const observer = new VideoObserver();
    const mockNode = {} as Node;
    observer.startObserving(mockNode, () => {});
    observer.stopObserving();
  });
});
