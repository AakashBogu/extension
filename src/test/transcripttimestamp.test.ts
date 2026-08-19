import { describe, it, expect } from 'vitest';
import { TranscriptTimestampNormalizer } from '../core/speech/transcript/TranscriptTimestampNormalizer';

describe('Module 4: TranscriptTimestampNormalizer', () => {
  it('should normalize timestamps relative to recognition session start', () => {
    const normalizer = new TranscriptTimestampNormalizer();
    const sessionStart = 1000;

    expect(normalizer.normalizeTimestamp(1500, sessionStart)).toBe(500);
    expect(normalizer.normalizeTimestamp(800, sessionStart)).toBe(0);
  });
});
