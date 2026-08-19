import { AppError } from '../../error/AppError';

export class ClaimDetectionError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_CLAIM_DETECTION', details);
    this.name = 'ClaimDetectionError';
  }
}

export class ClaimCandidateError extends AppError {
  constructor(reason: string) {
    super(`Claim candidate detection error: ${reason}`, 'ERR_CLAIM_CANDIDATE', { reason });
    this.name = 'ClaimCandidateError';
  }
}

export class ClaimExtractionError extends AppError {
  constructor(reason: string) {
    super(`Claim extraction error: ${reason}`, 'ERR_CLAIM_EXTRACTION', { reason });
    this.name = 'ClaimExtractionError';
  }
}

export class ClaimNormalizationError extends AppError {
  constructor(reason: string) {
    super(`Claim normalization error: ${reason}`, 'ERR_CLAIM_NORMALIZATION', { reason });
    this.name = 'ClaimNormalizationError';
  }
}

export class ClaimClassificationError extends AppError {
  constructor(reason: string) {
    super(`Claim classification error: ${reason}`, 'ERR_CLAIM_CLASSIFICATION', { reason });
    this.name = 'ClaimClassificationError';
  }
}

export class ClaimProviderError extends AppError {
  constructor(providerId: string, reason: string) {
    super(`Claim analysis provider [${providerId}] error: ${reason}`, 'ERR_CLAIM_PROVIDER', { providerId, reason });
    this.name = 'ClaimProviderError';
  }
}

export class ClaimRegistryError extends AppError {
  constructor(claimId: string, reason: string) {
    super(`Claim registry error for [${claimId}]: ${reason}`, 'ERR_CLAIM_REGISTRY', { claimId, reason });
    this.name = 'ClaimRegistryError';
  }
}

export class ClaimDetectionRecoveryError extends AppError {
  constructor(attempts: number, reason: string) {
    super(`Claim detection recovery failed after ${attempts} attempts: ${reason}`, 'ERR_CLAIM_DETECTION_RECOVERY', { attempts, reason });
    this.name = 'ClaimDetectionRecoveryError';
  }
}

export class ClaimDetectionTimeoutError extends AppError {
  constructor(timeoutMs: number) {
    super(`Claim detection operation timed out after ${timeoutMs}ms`, 'ERR_CLAIM_DETECTION_TIMEOUT', { timeoutMs });
    this.name = 'ClaimDetectionTimeoutError';
  }
}
