import { describe, it, expect } from 'vitest';
import { VisibilityTracker } from '../core/video/selection/VisibilityTracker';

describe('Module 2E: VisibilityTracker & ViewportObserver', () => {
  it('should track visibility ratios for video elements', () => {
    const tracker = new VisibilityTracker();
    const mockEl = {} as Element;

    tracker.trackVisibility('v100', mockEl, (_vId, _ratio) => {});
    expect(tracker.getVisibilityRatio('v100')).toBe(1.0);

    tracker.stopTracking(mockEl, 'v100');
    expect(tracker.getVisibilityRatio('v100')).toBe(0);
  });
});
