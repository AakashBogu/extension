import { describe, it, expect, beforeEach } from 'vitest';
import { VideoLifecycleManager } from '../core/video/lifecycle/VideoLifecycleManager';
import { EventBus } from '../core/events/EventBus';

describe('Module 2C: VideoLifecycleManager & Observer', () => {
  let manager: VideoLifecycleManager;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    manager = new VideoLifecycleManager(eventBus);
  });

  it('should process events and publish state_changed, playing, and paused events', async () => {
    let stateChanged = false;
    let isPlaying = false;
    let isPaused = false;

    eventBus.subscribe('video.state_changed', () => { stateChanged = true; });
    eventBus.subscribe('video.playing', () => { isPlaying = true; });
    eventBus.subscribe('video.paused', () => { isPaused = true; });

    manager.handleVideoEvent('v1', 'loadedmetadata');
    expect(stateChanged).toBe(true);

    manager.handleVideoEvent('v1', 'play');
    expect(isPlaying).toBe(true);

    manager.handleVideoEvent('v1', 'pause');
    expect(isPaused).toBe(true);

    const entry = manager.registry.getLifecycleEntry('v1');
    expect(entry?.currentState).toBe('PAUSED');
    expect(entry?.history.length).toBe(3);
  });

  it('should attach and detach listeners cleanly on HTMLVideoElement mock', () => {
    const eventHandlers = new Map<string, EventListener>();
    const mockVideoEl = {
      addEventListener: (evt: string, fn: EventListener) => eventHandlers.set(evt, fn),
      removeEventListener: (evt: string, _fn: EventListener) => eventHandlers.delete(evt)
    } as unknown as HTMLVideoElement;

    manager.attachVideo('v10', mockVideoEl);
    expect(eventHandlers.size).toBeGreaterThan(0);

    manager.detachVideo('v10', mockVideoEl);
    expect(eventHandlers.size).toBe(0);
  });
});
