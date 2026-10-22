import { SanitizedVerificationRequest, RerankedEvidence, EvidenceStanceAnalysis, FactCheckVerdict, SearchQuerySpec } from '../VerificationTypes';
import { VerificationQueryGenerator } from '../query/VerificationQueryGenerator';
import { StanceAnalyzer } from '../stance/StanceAnalyzer';
import { VerdictSynthesizer } from '../synthesis/VerdictSynthesizer';
import { IEventBus } from '../../events/IEventBus';
import { EventTopic } from '../../events/EventTypes';

export class VerificationRecoveryManager {
  constructor(
    private readonly queryGenerator: VerificationQueryGenerator,
    private readonly stanceAnalyzer: StanceAnalyzer,
    private readonly verdictSynthesizer: VerdictSynthesizer,
    private readonly eventBus?: IEventBus
  ) {}

  /**
   * Recovers from a query generation failure by producing rule-based heuristic queries.
   */
  public recoverQueryGeneration(request: SanitizedVerificationRequest, error?: unknown): SearchQuerySpec[] {
    this.notifyRecovery('query_generation_fallback', request.claimId, error);
    return this.queryGenerator.generateHeuristicQueries(request);
  }

  /**
   * Recovers from a stance analysis failure for an evidence item.
   */
  public recoverStanceAnalysis(
    item: RerankedEvidence,
    request: SanitizedVerificationRequest,
    error?: unknown
  ): EvidenceStanceAnalysis {
    this.notifyRecovery('stance_analysis_fallback', request.claimId, error);
    return this.stanceAnalyzer.heuristicStanceAnalysis(item, request);
  }

  /**
   * Recovers from a verdict synthesis failure by using rule-based weighted voting.
   */
  public recoverVerdictSynthesis(
    request: SanitizedVerificationRequest,
    evidenceList: RerankedEvidence[],
    stanceAnalyses: EvidenceStanceAnalysis[],
    startTime: number,
    error?: unknown
  ): FactCheckVerdict {
    this.notifyRecovery('verdict_synthesis_fallback', request.claimId, error);

    const stanceDist = {
      SUPPORTING: 0,
      REFUTING: 0,
      NEUTRAL: 0,
      INSUFFICIENT_EVIDENCE: 0,
      CONFLICTING: 0
    };
    for (const sa of stanceAnalyses) {
      stanceDist[sa.stance] = (stanceDist[sa.stance] || 0) + 1;
    }

    return this.verdictSynthesizer.heuristicVerdictSynthesis(
      request,
      evidenceList,
      stanceAnalyses,
      stanceDist,
      startTime
    );
  }

  private notifyRecovery(recoveryType: string, claimId: string, error?: unknown): void {
    if (this.eventBus) {
      const errMsg = error instanceof Error ? error.message : String(error || 'Unknown error');
      this.eventBus.publish('system.diagnostic' as EventTopic, {
        topic: 'verification.recovery_applied',
        recoveryType,
        claimId,
        error: errMsg,
        timestamp: Date.now()
      });
    }
  }
}
