export class EntityClaimDetector {
  hasEntityClaim(text: string): boolean {
    return /[A-Z][a-z]+ (is|was|were|has|declared|announced|stated)/.test(text);
  }
}
