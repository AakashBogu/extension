export class NumericalClaimDetector {
  hasNumericalClaim(text: string): boolean {
    return /\b(\d+|percent|%|million|billion|trillion|dollar|\$)\b/i.test(text);
  }
}
