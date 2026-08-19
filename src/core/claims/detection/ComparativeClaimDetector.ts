export class ComparativeClaimDetector {
  hasComparativeClaim(text: string): boolean {
    return /\b(more than|less than|higher than|lower than|compared to|faster than|slower than)\b/i.test(text);
  }
}
