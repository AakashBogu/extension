export class AttributionClaimDetector {
  hasAttributionClaim(text: string): boolean {
    return /\b(according to|stated that|reported by|claims that|said that)\b/i.test(text);
  }
}
