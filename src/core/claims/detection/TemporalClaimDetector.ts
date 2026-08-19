export class TemporalClaimDetector {
  hasTemporalClaim(text: string): boolean {
    return /\b(in \d{4}|yesterday|today|last year|next year|century|decade|month)\b/i.test(text);
  }
}
