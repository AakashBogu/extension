import { AppError } from './AppError';

export class VerificationError extends AppError {
  constructor(message: string, code: string = 'ERR_VERIFICATION', details?: Record<string, unknown>) {
    super(message, code, details);
    this.name = 'VerificationError';
  }
}

export class VerificationQueueFullError extends VerificationError {
  constructor(message: string = 'Verification queue capacity limit reached', details?: Record<string, unknown>) {
    super(message, 'ERR_VERIFICATION_QUEUE_FULL', details);
    this.name = 'VerificationQueueFullError';
  }
}

export class VerificationTaskTimeoutError extends VerificationError {
  constructor(message: string = 'Verification task timed out', details?: Record<string, unknown>) {
    super(message, 'ERR_VERIFICATION_TASK_TIMEOUT', details);
    this.name = 'VerificationTaskTimeoutError';
  }
}

export class VerificationTaskCancelledError extends VerificationError {
  constructor(message: string = 'Verification task was cancelled', details?: Record<string, unknown>) {
    super(message, 'ERR_VERIFICATION_TASK_CANCELLED', details);
    this.name = 'VerificationTaskCancelledError';
  }
}

export class VerificationShutdownError extends VerificationError {
  constructor(message: string = 'Verification pipeline is shutting down', details?: Record<string, unknown>) {
    super(message, 'ERR_VERIFICATION_SHUTDOWN', details);
    this.name = 'VerificationShutdownError';
  }
}

export class VerificationSanitizationError extends VerificationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_VERIFICATION_SANITIZATION', details);
    this.name = 'VerificationSanitizationError';
  }
}

export class VerificationQueryGenerationError extends VerificationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_VERIFICATION_QUERY_GEN', details);
    this.name = 'VerificationQueryGenerationError';
  }
}

export class EvidenceFetchingError extends VerificationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_EVIDENCE_FETCHING', details);
    this.name = 'EvidenceFetchingError';
  }
}

export class RerankingError extends VerificationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_RERANKING', details);
    this.name = 'RerankingError';
  }
}

export class StanceAnalysisError extends VerificationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_STANCE_ANALYSIS', details);
    this.name = 'StanceAnalysisError';
  }
}

export class VerdictSynthesisError extends VerificationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_VERDICT_SYNTHESIS', details);
    this.name = 'VerdictSynthesisError';
  }
}
