import { describe, it, expect } from 'vitest';
import { SpeechSegmentManager } from '../core/audio/processing/SpeechSegmentManager';

describe('Module 3C: SpeechSegmentManager', () => {
  it('should track speech segment lifecycle from start to finalization', () => {
    const manager = new SpeechSegmentManager();

    const seg = manager.startSegment(1, 0.9);
    expect(seg.frameCount).toBe(1);

    manager.appendFrame();
    expect(seg.frameCount).toBe(2);

    const finalized = manager.finalizeSegment(5);
    expect(finalized?.sequenceEnd).toBe(5);
    expect(finalized?.durationMs).toBeGreaterThanOrEqual(0);
    expect(manager.getCurrentSegment()).toBeNull();
  });
});
