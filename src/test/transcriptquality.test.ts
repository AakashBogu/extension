import { describe, it, expect } from 'vitest';
import { TranscriptQualityManager } from '../core/speech/transcript/TranscriptQualityManager';
import { TranscriptSegmentRecord } from '../core/speech/transcript/TranscriptTypes';

describe('Module 4: TranscriptQualityManager', () => {
  it('should evaluate segment confidence and timestamp validity', () => {
    const manager = new TranscriptQualityManager();

    const lowConfSeg: TranscriptSegmentRecord = {
      segmentId: 'l1', sessionId: 's', text: 'low', startTime: 100, endTime: 200, confidence: 0.2, language: 'en', providerId: 'p', sequenceNumber: 1, createdAt: Date.now(), isFinal: true
    };

    const evalRes = manager.evaluateSegmentQuality(lowConfSeg);
    expect(evalRes.isHighQuality).toBe(false);
    expect(evalRes.flags).toContain('LOW_CONFIDENCE');
  });
});
