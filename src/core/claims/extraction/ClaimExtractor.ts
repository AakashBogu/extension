import { ClaimNormalizer } from './ClaimNormalizer';

export class ClaimExtractor {
  private normalizer = new ClaimNormalizer();

  extractProposition(sentence: string): { extractedText: string; normalizedText: string } {
    const trimmed = sentence.trim();
    const normalizedText = this.normalizer.normalizeClaimText(trimmed);

    return {
      extractedText: trimmed,
      normalizedText
    };
  }
}
