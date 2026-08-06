import { describe, it, expect, beforeEach } from 'vitest';
import { PlaybackTrackingEngine } from '../core/video/playback/PlaybackTrackingEngine';
import { EventBus } from '../core/events/EventBus';

describe('Module 2D: PlaybackTrackingEngine & Tracker', () => {
  let engine: PlaybackTrackingEngine;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    engine = new PlaybackTrackingEngine(eventBus);
  });

  it('should process playback events and emit EventBus topics', () => {
    let updated = false;
    let paused = false;
    let rateChanged = false;

    eventBus.subscribe('playback.updated', () => { updated = true; });
    eventBus.subscribe('playback.paused', () => { paused = true; });
    eventBus.subscribe('playback.rate_changed', () => { rateChanged = true; });

    const mockVideoEl = {
      currentTime: 12.5,
      duration: 120.0,
      playbackRate: 1.5,
      volume: 0.8,
      muted: false,
      paused: true,
      ended: false,
      loop: false,
      seeking: false,
      videoWidth: 1920,
      videoHeight: 1080
    } as unknown as HTMLVideoElement;

    engine.handlePlaybackEvent('v1', mockVideoEl, 'pause');
    expect(updated).toBe(true);
    expect(paused).toBe(true);

    engine.handlePlaybackEvent('v1', mockVideoEl, 'ratechange');
    expect(rateChanged).toBe(true);

    const record = engine.registry.getRecord('v1');
    expect(record?.latestState.currentTime).toBe(12.5);
    expect(record?.latestState.playbackRate).toBe(1.5);
  });
});
