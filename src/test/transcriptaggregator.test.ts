import { describe, it, expect } from 'vitest';
import { TranscriptAggregator } from '../core/speech/transcript/TranscriptAggregator';
import { RecognitionResult } from '../core/speech/transcript/TranscriptTypes';

describe('Module 4: TranscriptAggregator', () => {
  it('should aggregate final results into a FinalizedTranscript', () => {
    const aggregator = new TranscriptAggregator();

    const result: RecognitionResult = {
      id: 'r1',
      sessionId: 's100',
      providerId: 'null-provider',
      timestamp: Date.now(),
      sequenceNumber: 1,
      isFinal: true,
      confidence: 0.95,
      language: 'en-US',
      text: 'Fact checking video speech.',
      startTime: 1000,
      endTime: 2000
    };

    const segment = aggregator.processResult(result);
    expect(segment).not.toBeNull();
    expect(segment?.isFinal).toBe(true);

    const finalized = aggregator.buildFinalizedTranscript('s100', 'null-provider', 'en-US', 'v123');
    expect(finalized.segments.length).toBe(1);
    expect(finalized.fullText).toBe('Fact checking video speech.');
    expect(finalized.averageConfidence).toBe(0.95);
  });
});
