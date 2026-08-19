export class CausalClaimDetector {
  hasCausalClaim(text: string): boolean {
    return /\b(because|caused by|led to|resulted in|due to)\b/i.test(text);
  }
}
