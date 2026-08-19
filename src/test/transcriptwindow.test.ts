import { describe, it, expect } from 'vitest';
import { TranscriptWindowManager } from '../core/claims/context/TranscriptWindowManager';
import { TranscriptSegmentRecord } from '../core/speech/transcript/TranscriptTypes';

describe('Module 5: TranscriptWindowManager', () => {
  it('should maintain a rolling transcript context window', () => {
    const manager = new TranscriptWindowManager(2);
    const seg1: TranscriptSegmentRecord = { segmentId: 's1', sessionId: 'sess', text: 'Hello.', startTime: 0, endTime: 100, confidence: 0.9, language: 'en', providerId: 'p', sequenceNumber: 1, createdAt: Date.now(), isFinal: true };
    const seg2: TranscriptSegmentRecord = { segmentId: 's2', sessionId: 'sess', text: 'World.', startTime: 100, endTime: 200, confidence: 0.9, language: 'en', providerId: 'p', sequenceNumber: 2, createdAt: Date.now(), isFinal: true };

    manager.addSegment(seg1);
    manager.addSegment(seg2);
    expect(manager.getWindowText()).toBe('Hello. World.');
  });
});
