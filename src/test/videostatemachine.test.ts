import { describe, it, expect, beforeEach } from 'vitest';
import { VideoStateMachine } from '../core/video/lifecycle/VideoStateMachine';
import { LifecycleTransitionError } from '../core/error/VideoLifecycleErrors';

describe('Module 2C: VideoStateMachine', () => {
  let sm: VideoStateMachine;

  beforeEach(() => {
    sm = new VideoStateMachine();
  });

  it('should allow valid state transitions', () => {
    expect(sm.canTransition('DISCOVERED', 'METADATA_LOADING')).toBe(true);
    expect(sm.canTransition('METADATA_LOADING', 'METADATA_READY')).toBe(true);
    expect(sm.canTransition('METADATA_READY', 'PLAYING')).toBe(true);
    expect(sm.canTransition('PLAYING', 'PAUSED')).toBe(true);
    expect(sm.canTransition('PAUSED', 'PLAYING')).toBe(true);
  });

  it('should reject invalid state transitions via transition method', () => {
    expect(() => sm.transition('vid_1', 'UNKNOWN', 'PLAYING')).toThrow(LifecycleTransitionError);
  });
});
