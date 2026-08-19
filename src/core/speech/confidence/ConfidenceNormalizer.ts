export class ConfidenceNormalizer {
  normalize(confidence: number): number {
    if (Number.isNaN(confidence) || !Number.isFinite(confidence)) return 0.5;
    return Math.max(0.0, Math.min(1.0, confidence));
  }
}
