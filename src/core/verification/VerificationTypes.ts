import { ClaimPriorityLevel, ClaimVerifiabilityLevel, ClaimTypeCategory } from '../claims/ClaimTypes';

export type StanceType = 'SUPPORTING' | 'REFUTING' | 'NEUTRAL' | 'INSUFFICIENT_EVIDENCE' | 'CONFLICTING';

export type VerdictLabel =
  | 'TRUE'
  | 'MOSTLY_TRUE'
  | 'HALF_TRUE'
  | 'MOSTLY_FALSE'
  | 'FALSE'
  | 'UNVERIFIABLE'
  | 'MIXTURE';

export type VerificationStatus =
  | 'IDLE'
  | 'INITIALIZING'
  | 'READY'
  | 'RUNNING'
  | 'PAUSED'
  | 'DRAINING'
  | 'STOPPING'
  | 'STOPPED'
  | 'ERROR'
  | 'RECOVERING'
  | 'DESTROYED';

export type VerificationTaskStatus =
  | 'QUEUED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'QUEUE_REJECTED';

export interface SanitizedVerificationRequest {
  claimId: string;
  claimText: string;
  normalizedText: string;
  classification: ClaimTypeCategory[];
  verifiability: ClaimVerifiabilityLevel;
  priority: ClaimPriorityLevel;
  entities: Array<{ type: string; text: string }>;
  confidence: number;
  createdAt: number;
}

export type SearchQueryType = 'KEYWORD' | 'ENTITY_ORIENTED' | 'STANCE_SPECIFIC' | 'COUNTER_FACTUAL';

export interface SearchQuerySpec {
  queryId: string;
  claimId: string;
  queryText: string;
  queryType: SearchQueryType;
  weight: number;
  targetDomain?: string;
}

export interface RawEvidenceItem {
  evidenceId: string;
  claimId: string;
  queryId: string;
  title: string;
  url: string;
  snippet: string;
  sourceName: string;
  publishedAt?: number;
  providerId: string;
  retrievedAt: number;
}

export interface RerankedEvidence {
  evidence: RawEvidenceItem;
  canonicalUrl: string;
  credibilityScore: number;
  freshnessScore: number;
  relevanceScore: number;
  diversityPenalty: number;
  compositeScore: number;
  rank: number;
  matchedEntities: string[];
}

export interface EvidenceStanceAnalysis {
  evidenceId: string;
  claimId: string;
  stance: StanceType;
  confidence: number;
  explanation: string;
  keyQuotes: string[];
}

export interface FactCheckVerdict {
  verdictId: string;
  claimId: string;
  claimText: string;
  verdict: VerdictLabel;
  confidenceScore: number;
  verifiabilityScore: number;
  summaryExplanation: string;
  topEvidence: RerankedEvidence[];
  stanceDistribution: Record<StanceType, number>;
  totalEvidenceCount: number;
  executionTimeMs: number;
  synthesizedAt: number;
  cached?: boolean;
  fallback?: boolean;
}

export interface VerificationPipelineConfig {
  enabled: boolean;
  boundedCapacity: number;
  concurrencyLimit: number;
  maxQueriesPerClaim: number;
  maxResultsPerQuery: number;
  maxRankedEvidence: number;
  minCredibilityThreshold: number;
  staleTaskTtlMs: number;
  taskTimeoutMs: number;
  cacheTtlMs: number;
  maxCacheSize: number;
  weights: {
    relevance: number;
    credibility: number;
    freshness: number;
  };
}

export interface VerificationMetrics {
  totalVerificationsStarted: number;
  totalVerificationsCompleted: number;
  totalVerificationsFailed: number;
  totalVerificationsRejected: number;
  totalVerificationsExpired: number;
  averageExecutionTimeMs: number;
  cacheHitRate: number;
  queueDepth: number;
  queueUtilizationPercent: number;
  verdictDistribution: Record<VerdictLabel, number>;
}
