import { ProviderError, ProviderErrorOptions } from './ProviderErrors';

export class ProviderExecutionError extends ProviderError {
  constructor(message: string, code: string = 'ERR_PROVIDER_EXECUTION', options?: ProviderErrorOptions) {
    super(message, code, options);
    this.name = 'ProviderExecutionError';
  }
}

export class ProviderRequestValidationError extends ProviderExecutionError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_REQUEST_VALIDATION', options);
    this.name = 'ProviderRequestValidationError';
  }
}

export class ProviderRequestTimeoutError extends ProviderExecutionError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_REQUEST_TIMEOUT', { ...options, retryable: options?.retryable ?? true });
    this.name = 'ProviderRequestTimeoutError';
  }
}

export class ProviderRequestCancelledError extends ProviderExecutionError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_REQUEST_CANCELLED', { ...options, retryable: false });
    this.name = 'ProviderRequestCancelledError';
  }
}

export class ProviderRetryExhaustedError extends ProviderExecutionError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_RETRY_EXHAUSTED', { ...options, retryable: false });
    this.name = 'ProviderRetryExhaustedError';
  }
}

export class ProviderFallbackExhaustedError extends ProviderExecutionError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_FALLBACK_EXHAUSTED', { ...options, retryable: false });
    this.name = 'ProviderFallbackExhaustedError';
  }
}

export class ProviderExecutionStateError extends ProviderExecutionError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_EXECUTION_STATE', options);
    this.name = 'ProviderExecutionStateError';
  }
}

export class ProviderConcurrencyError extends ProviderExecutionError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_CONCURRENCY', { ...options, retryable: true });
    this.name = 'ProviderConcurrencyError';
  }
}

export class ProviderResponseNormalizationError extends ProviderExecutionError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_RESPONSE_NORMALIZATION', options);
    this.name = 'ProviderResponseNormalizationError';
  }
}

export class ProviderExecutionRecoveryError extends ProviderExecutionError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_EXECUTION_RECOVERY', options);
    this.name = 'ProviderExecutionRecoveryError';
  }
}
