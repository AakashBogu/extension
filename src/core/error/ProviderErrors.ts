import { AppError } from './AppError';

export interface ProviderErrorOptions {
  providerId?: string;
  requestId?: string;
  correlationId?: string;
  retryable?: boolean;
  details?: Record<string, unknown>;
}

export class ProviderError extends AppError {
  public readonly providerId?: string;
  public readonly requestId?: string;
  public readonly correlationId?: string;
  public readonly retryable: boolean;
  public readonly timestamp: number;

  constructor(message: string, code: string = 'ERR_PROVIDER', options: ProviderErrorOptions = {}) {
    super(message, code, options.details);
    this.name = 'ProviderError';
    this.providerId = options.providerId;
    this.requestId = options.requestId;
    this.correlationId = options.correlationId;
    this.retryable = options.retryable ?? false;
    this.timestamp = Date.now();
  }
}

export class ProviderInitializationError extends ProviderError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_INIT', options);
    this.name = 'ProviderInitializationError';
  }
}

export class ProviderConfigurationError extends ProviderError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_CONFIG', options);
    this.name = 'ProviderConfigurationError';
  }
}

export class ProviderCapabilityError extends ProviderError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_CAPABILITY', options);
    this.name = 'ProviderCapabilityError';
  }
}

export class ProviderRequestError extends ProviderError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_REQUEST', { ...options, retryable: options?.retryable ?? true });
    this.name = 'ProviderRequestError';
  }
}

export class ProviderResponseError extends ProviderError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_RESPONSE', options);
    this.name = 'ProviderResponseError';
  }
}
