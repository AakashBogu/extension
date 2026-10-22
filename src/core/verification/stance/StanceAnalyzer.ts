import { SanitizedVerificationRequest, RerankedEvidence, EvidenceStanceAnalysis, StanceType } from '../VerificationTypes';
import { ProviderExecutionEngine } from '../../providers/execution/ProviderExecutionEngine';
import { StanceAnalysisError } from '../../error/VerificationErrors';
import { AIRequest } from '../../providers/ai/AIProviderTypes';
import { VerificationRequestSanitizer } from '../VerificationRequestSanitizer';

export class StanceAnalyzer {
  constructor(
    private readonly executionEngine: ProviderExecutionEngine,
    private readonly sanitizer: VerificationRequestSanitizer = new VerificationRequestSanitizer()
  ) {}

  /**
   * Analyzes the stance of top evidence items relative to the claim.
   * Uses ProviderExecutionEngine (CLAIM_ANALYSIS / SOURCE_ANALYSIS operation) with heuristic fallback.
   */
  public async analyzeStances(
    evidenceList: RerankedEvidence[],
    request: SanitizedVerificationRequest,
    correlationId?: string,
    abortSignal?: AbortSignal
  ): Promise<EvidenceStanceAnalysis[]> {
    if (!evidenceList || evidenceList.length === 0) {
      return [];
    }

    const corrId = correlationId || `corr_stance_${request.claimId}_${Date.now()}`;
    const analyses: EvidenceStanceAnalysis[] = [];

    for (const item of evidenceList) {
      if (abortSignal?.aborted) {
        throw new StanceAnalysisError(`Stance analysis aborted for claim: ${request.claimId}`);
      }

      try {
        const aiRequest: AIRequest = {
          requestId: `req_stance_${item.evidence.evidenceId}_${Date.now()}`,
          correlationId: corrId,
          operation: 'CLAIM_ANALYSIS',
          input: JSON.stringify({
            claimText: this.sanitizer.sanitizeText(request.claimText),
            evidenceTitle: this.sanitizer.sanitizeText(item.evidence.title),
            evidenceSnippet: this.sanitizer.sanitizeText(item.evidence.snippet),
            sourceName: this.sanitizer.sanitizeText(item.evidence.sourceName)
          }),
          systemInstructions:
            'Determine if the evidence supports or refutes the claim. ' +
            'Return a JSON object with keys: "stance" ("SUPPORTING" | "REFUTING" | "NEUTRAL" | "INSUFFICIENT_EVIDENCE" | "CONFLICTING"), ' +
            '"confidence" (number 0-1), "explanation" (string), "keyQuotes" (array of string quotes).',
          temperature: 0.1,
          maxTokens: 256,
          createdAt: Date.now()
        };

        const aiResponse = await this.executionEngine.executeAI(aiRequest);

        let parsed: { stance?: StanceType; confidence?: number; explanation?: string; keyQuotes?: string[] } = {};
        if (aiResponse.structuredOutput) {
          parsed = aiResponse.structuredOutput as typeof parsed;
        } else {
          const match = aiResponse.content.match(/\{[\s\S]*\}/);
          if (match) {
            parsed = JSON.parse(match[0]);
          }
        }

        if (parsed.stance) {
          analyses.push({
            evidenceId: item.evidence.evidenceId,
            claimId: request.claimId,
            stance: parsed.stance,
            confidence: parsed.confidence ?? 0.8,
            explanation: parsed.explanation || 'Stance evaluated via AI provider analysis.',
            keyQuotes: parsed.keyQuotes || [item.evidence.snippet]
          });
          continue;
        }
      } catch {
        // Fall back to heuristic stance analysis for this evidence item
      }

      // Rule-based heuristic fallback
      analyses.push(this.heuristicStanceAnalysis(item, request));
    }

    return analyses;
  }

  /**
   * Heuristic rule-based stance analyzer using term overlap and negation keywords.
   */
  public heuristicStanceAnalysis(
    item: RerankedEvidence,
    request: SanitizedVerificationRequest
  ): EvidenceStanceAnalysis {
    const text = `${item.evidence.title} ${item.evidence.snippet}`.toLowerCase();

    const negationWords = ['false', 'fake', 'incorrect', 'debunked', 'misleading', 'myth', 'untrue', 'denies', 'refutes', 'no evidence', 'hoax'];
    const supportWords = ['confirms', 'verifies', 'true', 'proved', 'accurate', 'supported', 'shows', 'announced', 'reports'];

    let refutingScore = 0;
    let supportingScore = 0;

    for (const nWord of negationWords) {
      if (text.includes(nWord)) refutingScore += 1;
    }
    for (const sWord of supportWords) {
      if (text.includes(sWord)) supportingScore += 1;
    }

    let stance: StanceType = 'NEUTRAL';
    let confidence = 0.5;

    if (refutingScore > supportingScore) {
      stance = 'REFUTING';
      confidence = Math.min(0.9, 0.5 + refutingScore * 0.15);
    } else if (supportingScore > refutingScore) {
      stance = 'SUPPORTING';
      confidence = Math.min(0.9, 0.5 + supportingScore * 0.15);
    } else if (item.relevanceScore > 0.6) {
      stance = 'SUPPORTING';
      confidence = 0.6;
    } else {
      stance = 'INSUFFICIENT_EVIDENCE';
      confidence = 0.4;
    }

    return {
      evidenceId: item.evidence.evidenceId,
      claimId: request.claimId,
      stance,
      confidence: Number(confidence.toFixed(2)),
      explanation: `Heuristic stance analysis derived from keyword alignment (supporting: ${supportingScore}, refuting: ${refutingScore}).`,
      keyQuotes: item.evidence.snippet ? [item.evidence.snippet] : []
    };
  }
}
