export class SentenceSegmenter {
  segmentSentences(text: string): string[] {
    if (!text || !text.trim()) return [];

    // Split on punctuation followed by space
    const sentences = text.trim().split(/(?<=[.?!])\s+/g);
    return sentences.map(s => s.trim()).filter(s => s.length > 0);
  }
}
