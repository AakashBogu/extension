import {
  SanitizedVerificationRequest,
  RerankedEvidence,
  EvidenceStanceAnalysis,
  FactCheckVerdict,
  VerdictLabel,
  StanceType
} from '../VerificationTypes';
import { ProviderExecutionEngine } from '../../providers/execution/ProviderExecutionEngine';
import { VerdictSynthesisError } from '../../error/VerificationErrors';
import { AIRequest } from '../../providers/ai/AIProviderTypes';
import { VerificationRequestSanitizer } from '../VerificationRequestSanitizer';

export class VerdictSynthesizer {
  constructor(
    private readonly executionEngine: ProviderExecutionEngine,
    private readonly sanitizer: VerificationRequestSanitizer = new VerificationRequestSanitizer()
  ) {}

  /**
   * Synthesizes a final FactCheckVerdict from stance analyses and reranked evidence.
   * Uses ProviderExecutionEngine (EVIDENCE_SUMMARY operation) with heuristic fallback.
   */
  public async synthesizeVerdict(
    request: SanitizedVerificationRequest,
    evidenceList: RerankedEvidence[],
    stanceAnalyses: EvidenceStanceAnalysis[],
    startTime: number,
    correlationId?: string,
    abortSignal?: AbortSignal
  ): Promise<FactCheckVerdict> {
    if (!request || !request.claimId) {
      throw new VerdictSynthesisError('Invalid request provided to verdict synthesizer');
    }

    const corrId = correlationId || `corr_synth_${request.claimId}_${Date.now()}`;
    const stanceDist: Record<StanceType, number> = {
      SUPPORTING: 0,
      REFUTING: 0,
      NEUTRAL: 0,
      INSUFFICIENT_EVIDENCE: 0,
      CONFLICTING: 0
    };

    for (const sa of stanceAnalyses) {
      stanceDist[sa.stance] = (stanceDist[sa.stance] || 0) + 1;
    }

    // Insufficient evidence check
    if (!evidenceList || evidenceList.length === 0 || stanceAnalyses.length === 0) {
      return this.buildFallbackVerdict(
        request,
        'UNVERIFIABLE',
        0.2,
        'No credible external evidence could be retrieved to verify this claim.',
        evidenceList,
        stanceDist,
        startTime,
        true
      );
    }

    try {
      if (abortSignal?.aborted) {
        throw new VerdictSynthesisError(`Verdict synthesis aborted for claim: ${request.claimId}`);
      }

      const aiRequest: AIRequest = {
        requestId: `req_synth_${request.claimId}_${Date.now()}`,
        correlationId: corrId,
        operation: 'EVIDENCE_SUMMARY',
        input: JSON.stringify({
          claimText: this.sanitizer.sanitizeText(request.claimText),
          stanceAnalyses: stanceAnalyses.map(sa => ({
            stance: sa.stance,
            confidence: sa.confidence,
            explanation: this.sanitizer.sanitizeText(sa.explanation),
            quotes: (sa.keyQuotes || []).map(q => this.sanitizer.sanitizeText(q))
          })),
          topEvidence: evidenceList.slice(0, 3).map(e => ({
            title: this.sanitizer.sanitizeText(e.evidence.title),
            source: this.sanitizer.sanitizeText(e.evidence.sourceName),
            credibilityScore: e.credibilityScore
          }))
        }),
        systemInstructions:
          'Synthesize a final fact-check verdict for the claim based on the provided evidence. ' +
          'Return a JSON object with keys: "verdict" ("TRUE" | "MOSTLY_TRUE" | "HALF_TRUE" | "MOSTLY_FALSE" | "FALSE" | "UNVERIFIABLE" | "MIXTURE"), ' +
          '"confidenceScore" (number 0-1), "summaryExplanation" (concise string explanation).',
        temperature: 0.1,
        maxTokens: 384,
        createdAt: Date.now()
      };

      const aiResponse = await this.executionEngine.executeAI(aiRequest);

      let parsed: { verdict?: VerdictLabel; confidenceScore?: number; summaryExplanation?: string } = {};
      if (aiResponse.structuredOutput) {
        parsed = aiResponse.structuredOutput as typeof parsed;
      } else {
        const match = aiResponse.content.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        }
      }

      if (parsed.verdict && parsed.summaryExplanation) {
        return {
          verdictId: `vdet_${request.claimId}_${Date.now()}`,
          claimId: request.claimId,
          claimText: request.claimText,
          verdict: parsed.verdict,
          confidenceScore: parsed.confidenceScore ?? 0.85,
          verifiabilityScore: request.confidence || 0.8,
          summaryExplanation: parsed.summaryExplanation,
          topEvidence: evidenceList.slice(0, 5),
          stanceDistribution: stanceDist,
          totalEvidenceCount: evidenceList.length,
          executionTimeMs: Date.now() - startTime,
          synthesizedAt: Date.now(),
          fallback: false
        };
      }
    } catch {
      // AI Provider execution failed or timed out — fall back to rule-based verdict synthesis
    }

    // Heuristic Fallback Verdict
    return this.heuristicVerdictSynthesis(request, evidenceList, stanceAnalyses, stanceDist, startTime);
  }

  /**
   * Rule-based heuristic verdict synthesis via weighted stance voting.
   */
  public heuristicVerdictSynthesis(
    request: SanitizedVerificationRequest,
    evidenceList: RerankedEvidence[],
    stanceAnalyses: EvidenceStanceAnalysis[],
    stanceDist: Record<StanceType, number>,
    startTime: number
  ): FactCheckVerdict {
    let totalWeight = 0;
    let supportingWeight = 0;
    let refutingWeight = 0;

    const stanceMap = new Map<string, EvidenceStanceAnalysis>();
    for (const sa of stanceAnalyses) {
      stanceMap.set(sa.evidenceId, sa);
    }

    for (const item of evidenceList) {
      const sa = stanceMap.get(item.evidence.evidenceId);
      const stance = sa ? sa.stance : 'NEUTRAL';
      const weight = item.compositeScore * (sa ? sa.confidence : 0.5);

      totalWeight += weight;
      if (stance === 'SUPPORTING') {
        supportingWeight += weight;
      } else if (stance === 'REFUTING') {
        refutingWeight += weight;
      }
    }

    let verdict: VerdictLabel = 'UNVERIFIABLE';
    let summaryExplanation = 'Evidence retrieved is inconclusive.';
    let confidenceScore = 0.5;

    if (totalWeight > 0) {
      const supRatio = supportingWeight / totalWeight;
      const refRatio = refutingWeight / totalWeight;

      if (supRatio >= 0.75) {
        verdict = 'TRUE';
        summaryExplanation = 'Multiple credible sources strongly support this claim.';
        confidenceScore = Number((0.6 + supRatio * 0.35).toFixed(2));
      } else if (supRatio >= 0.55) {
        verdict = 'MOSTLY_TRUE';
        summaryExplanation = 'Evidence predominantly supports the claim with minor caveats.';
        confidenceScore = Number((0.55 + supRatio * 0.3).toFixed(2));
      } else if (refRatio >= 0.75) {
        verdict = 'FALSE';
        summaryExplanation = 'Multiple credible sources explicitly refute this claim.';
        confidenceScore = Number((0.6 + refRatio * 0.35).toFixed(2));
      } else if (refRatio >= 0.55) {
        verdict = 'MOSTLY_FALSE';
        summaryExplanation = 'Evidence contains significant inaccuracies and is mostly false.';
        confidenceScore = Number((0.55 + refRatio * 0.3).toFixed(2));
      } else if (supRatio > 0.3 && refRatio > 0.3) {
        verdict = 'MIXTURE';
        summaryExplanation = 'Available evidence contains contradictory statements from different sources.';
        confidenceScore = 0.6;
      } else {
        verdict = 'UNVERIFIABLE';
        summaryExplanation = 'Retrieved evidence does not contain sufficient factual details to verify.';
        confidenceScore = 0.4;
      }
    }

    return this.buildFallbackVerdict(
      request,
      verdict,
      confidenceScore,
      summaryExplanation,
      evidenceList,
      stanceDist,
      startTime,
      true
    );
  }

  private buildFallbackVerdict(
    request: SanitizedVerificationRequest,
    verdict: VerdictLabel,
    confidenceScore: number,
    summaryExplanation: string,
    evidenceList: RerankedEvidence[],
    stanceDist: Record<StanceType, number>,
    startTime: number,
    isFallback: boolean
  ): FactCheckVerdict {
    return {
      verdictId: `vdet_${request.claimId}_${Date.now()}`,
      claimId: request.claimId,
      claimText: request.claimText,
      verdict,
      confidenceScore,
      verifiabilityScore: request.confidence || 0.5,
      summaryExplanation,
      topEvidence: evidenceList.slice(0, 5),
      stanceDistribution: stanceDist,
      totalEvidenceCount: evidenceList.length,
      executionTimeMs: Date.now() - startTime,
      synthesizedAt: Date.now(),
      fallback: isFallback
    };
  }
}
