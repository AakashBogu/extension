import { ProviderError, ProviderErrorOptions } from './ProviderErrors';

export class ProviderLimitError extends ProviderError {
  constructor(message: string, code: string = 'ERR_PROVIDER_LIMIT', options?: ProviderErrorOptions) {
    super(message, code, options);
    this.name = 'ProviderLimitError';
  }
}

export class ProviderRateLimitError extends ProviderLimitError {
  public readonly retryAfterMs?: number;

  constructor(message: string, options?: ProviderErrorOptions & { retryAfterMs?: number }) {
    super(message, 'ERR_PROVIDER_RATE_LIMIT', options);
    this.name = 'ProviderRateLimitError';
    this.retryAfterMs = options?.retryAfterMs;
  }
}

export class ProviderQuotaError extends ProviderLimitError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_QUOTA', options);
    this.name = 'ProviderQuotaError';
  }
}

export class ProviderAdmissionError extends ProviderLimitError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_ADMISSION', options);
    this.name = 'ProviderAdmissionError';
  }
}

export class ProviderCapacityError extends ProviderLimitError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_CAPACITY', options);
    this.name = 'ProviderCapacityError';
  }
}

export class ProviderCooldownError extends ProviderLimitError {
  public readonly retryAfterMs?: number;

  constructor(message: string, options?: ProviderErrorOptions & { retryAfterMs?: number }) {
    super(message, 'ERR_PROVIDER_COOLDOWN', options);
    this.name = 'ProviderCooldownError';
    this.retryAfterMs = options?.retryAfterMs;
  }
}
