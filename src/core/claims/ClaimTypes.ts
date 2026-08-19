export type ClaimTypeCategory =
  | 'FACTUAL'
  | 'NUMERICAL'
  | 'TEMPORAL'
  | 'CAUSAL'
  | 'COMPARATIVE'
  | 'PREDICTIVE'
  | 'ATTRIBUTED'
  | 'OPINION'
  | 'SUBJECTIVE'
  | 'QUESTION'
  | 'COMMAND'
  | 'UNVERIFIABLE'
  | 'MIXED';

export type ClaimVerifiabilityLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_VERIFIABLE';

export type ClaimPriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ClaimLifecycleStatus =
  | 'DETECTED'
  | 'EXTRACTED'
  | 'NORMALIZED'
  | 'CLASSIFIED'
  | 'QUEUED'
  | 'READY_FOR_VERIFICATION'
  | 'DUPLICATE'
  | 'DISCARDED'
  | 'EXPIRED';

export type ClaimEntityType =
  | 'PERSON'
  | 'ORGANIZATION'
  | 'LOCATION'
  | 'COUNTRY'
  | 'CITY'
  | 'PRODUCT'
  | 'EVENT'
  | 'DATE'
  | 'TIME'
  | 'NUMBER'
  | 'PERCENTAGE'
  | 'CURRENCY'
  | 'UNKNOWN';

export interface ClaimEntity {
  entityId: string;
  text: string;
  type: ClaimEntityType;
  startOffset: number;
  endOffset: number;
  confidence: number;
}

export interface ClaimProvenance {
  transcriptId: string;
  segmentIds: string[];
  sessionId: string;
  videoId?: string;
  startTime: number;
  endTime: number;
  speakerId?: string;
  providerId: string;
  createdAt: number;
}

export interface ClaimCandidate {
  claimId: string;
  text: string;
  normalizedText: string;
  classification: ClaimTypeCategory[];
  verifiability: ClaimVerifiabilityLevel;
  detectionConfidence: number;
  extractionConfidence: number;
  classificationConfidence: number;
  priority: ClaimPriorityLevel;
  status: ClaimLifecycleStatus;
  entities: ClaimEntity[];
  provenance: ClaimProvenance;
  occurrenceCount: number;
  firstSeenAt: number;
  lastSeenAt: number;
  createdAt: number;
}

export interface VerifiableClaim {
  claimId: string;
  text: string;
  normalizedText: string;
  classification: ClaimTypeCategory[];
  verifiability: ClaimVerifiabilityLevel;
  confidence: number;
  priority: ClaimPriorityLevel;
  entities: ClaimEntity[];
  provenance: ClaimProvenance;
  timestamps: {
    startTime: number;
    endTime: number;
  };
  occurrenceCount: number;
}

export interface ClaimDetectionConfig {
  enabled: boolean;
  minConfidenceThreshold: number;
  windowDurationMs: number;
  maxPendingClaims: number;
  deduplicationEnabled: boolean;
  providerPreference: string[];
  autoPrioritize: boolean;
}

export type ClaimDetectionStatus =
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
