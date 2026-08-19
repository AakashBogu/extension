import { describe, it, expect } from 'vitest';
import { TranscriptSegmentRegistry } from '../core/speech/transcript/TranscriptSegmentRegistry';
import { TranscriptSegmentRecord } from '../core/speech/transcript/TranscriptTypes';

describe('Module 4: TranscriptSegmentRegistry', () => {
  it('should order segments chronologically and prevent duplicate sequence entries', () => {
    const registry = new TranscriptSegmentRegistry();

    const seg1: TranscriptSegmentRecord = {
      segmentId: 's1',
      sessionId: 'sess1',
      text: 'First',
      startTime: 100,
      endTime: 200,
      confidence: 0.9,
      language: 'en-US',
      providerId: 'p1',
      sequenceNumber: 1,
      createdAt: Date.now(),
      isFinal: true
    };

    const seg2: TranscriptSegmentRecord = {
      segmentId: 's2',
      sessionId: 'sess1',
      text: 'Second',
      startTime: 200,
      endTime: 300,
      confidence: 0.95,
      language: 'en-US',
      providerId: 'p1',
      sequenceNumber: 2,
      createdAt: Date.now(),
      isFinal: true
    };

    registry.addSegment(seg2);
    registry.addSegment(seg1);

    const ordered = registry.getSegments();
    expect(ordered[0].text).toBe('First');
    expect(ordered[1].text).toBe('Second');
  });
});
