import { describe, it, expect } from 'vitest';
import { SentenceSegmenter } from '../core/claims/extraction/SentenceSegmenter';

describe('Module 5: SentenceSegmenter', () => {
  it('should segment text into sentences without splitting decimal numbers', () => {
    const segmenter = new SentenceSegmenter();
    const sentences = segmenter.segmentSentences('GDP grew by 5.5% in 2024. Next sentence starts here.');

    expect(sentences.length).toBe(2);
    expect(sentences[0]).toBe('GDP grew by 5.5% in 2024.');
  });
});
