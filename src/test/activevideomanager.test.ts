import { describe, it, expect, beforeEach } from 'vitest';
import { ActiveVideoManager } from '../core/video/selection/ActiveVideoManager';
import { EventBus } from '../core/events/EventBus';

describe('Module 2E: ActiveVideoManager & Selector', () => {
  let manager: ActiveVideoManager;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    manager = new ActiveVideoManager(eventBus);
  });

  it('should select highest scoring video and switch when factors change', () => {
    let activeChanged = false;
    eventBus.subscribe('active_video.changed', () => { activeChanged = true; });

    manager.addCandidate('v1', { isPlaying: false, visibilityRatio: 0.5 });
    manager.addCandidate('v2', { isPlaying: true, visibilityRatio: 1.0 });

    expect(manager.getActiveVideoId()).toBe('v2');
    expect(activeChanged).toBe(true);

    manager.updateCandidateFactors('v1', { isPlaying: true, isFullscreen: true, visibilityRatio: 1.0 });
    expect(manager.getActiveVideoId()).toBe('v1');
  });

  it('should support pinned video overrides and handle active video removal', () => {
    manager.addCandidate('v10', { isPlaying: true });
    manager.addCandidate('v20', { isPlaying: false });

    manager.selector.pinVideo('v20');
    manager.evaluateActiveVideo();

    expect(manager.getActiveVideoId()).toBe('v20');

    manager.removeCandidate('v20');
    expect(manager.getActiveVideoId()).toBe('v10');
  });
});
