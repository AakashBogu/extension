import { describe, it, expect } from 'vitest';
import { PartialTranscriptManager } from '../core/speech/transcript/PartialTranscriptManager';
import { RecognitionResult } from '../core/speech/transcript/TranscriptTypes';

describe('Module 4: PartialTranscriptManager', () => {
  it('should store and update streaming partial recognition results', () => {
    const manager = new PartialTranscriptManager();

    const partial1: RecognitionResult = {
      id: 'p1',
      sessionId: 's1',
      providerId: 'pr1',
      timestamp: Date.now(),
      sequenceNumber: 1,
      isFinal: false,
      confidence: 0.8,
      language: 'en-US',
      text: 'the president',
      startTime: 100,
      endTime: 200
    };

    manager.updatePartial(partial1);
    expect(manager.getActivePartial()?.text).toBe('the president');

    manager.clearPartial();
    expect(manager.getActivePartial()).toBeNull();
  });
});
