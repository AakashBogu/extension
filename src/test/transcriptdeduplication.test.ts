import { describe, it, expect } from 'vitest';
import { TranscriptDeduplicationManager } from '../core/speech/transcript/TranscriptDeduplicationManager';
import { RecognitionResult } from '../core/speech/transcript/TranscriptTypes';

describe('Module 4: TranscriptDeduplicationManager', () => {
  it('should detect duplicate recognition result IDs', () => {
    const deduplicator = new TranscriptDeduplicationManager();
    const res: RecognitionResult = { id: 'dup_1', sessionId: 's', providerId: 'p', timestamp: 1, sequenceNumber: 1, isFinal: true, confidence: 0.9, language: 'en', text: 'hi', startTime: 0, endTime: 1 };

    expect(deduplicator.isDuplicate(res)).toBe(false);
    expect(deduplicator.isDuplicate(res)).toBe(true);
  });
});
