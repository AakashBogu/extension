import { NumericalClaimDetector } from './NumericalClaimDetector';
import { TemporalClaimDetector } from './TemporalClaimDetector';
import { EntityClaimDetector } from './EntityClaimDetector';
import { CausalClaimDetector } from './CausalClaimDetector';
import { ComparativeClaimDetector } from './ComparativeClaimDetector';
import { AttributionClaimDetector } from './AttributionClaimDetector';

export class ClaimCandidateDetector {
  private numericalDetector = new NumericalClaimDetector();
  private temporalDetector = new TemporalClaimDetector();
  private entityDetector = new EntityClaimDetector();
  private causalDetector = new CausalClaimDetector();
  private comparativeDetector = new ComparativeClaimDetector();
  private attributionDetector = new AttributionClaimDetector();

  isClaimCandidate(text: string): { isCandidate: boolean; signals: string[] } {
    if (!text || text.trim().length < 10) return { isCandidate: false, signals: [] };

    // Negative filtering: questions, commands, pure greetings
    if (text.endsWith('?') || /^(what|how|why|who|where|when|can you|please|hello|hi|good morning)\b/i.test(text)) {
      return { isCandidate: false, signals: ['QUESTION_OR_COMMAND'] };
    }

    const signals: string[] = [];

    if (this.numericalDetector.hasNumericalClaim(text)) signals.push('NUMERICAL');
    if (this.temporalDetector.hasTemporalClaim(text)) signals.push('TEMPORAL');
    if (this.entityDetector.hasEntityClaim(text)) signals.push('ENTITY');
    if (this.causalDetector.hasCausalClaim(text)) signals.push('CAUSAL');
    if (this.comparativeDetector.hasComparativeClaim(text)) signals.push('COMPARATIVE');
    if (this.attributionDetector.hasAttributionClaim(text)) signals.push('ATTRIBUTION');

    // Declarative check
    if (/[a-zA-Z0-9] (is|was|were|has|have|grew|fell|dropped|increased|declared|announced|proved|discovered)\b/i.test(text)) {
      signals.push('DECLARATIVE');
    }

    const isCandidate = signals.length > 0;
    return { isCandidate, signals };
  }
}
