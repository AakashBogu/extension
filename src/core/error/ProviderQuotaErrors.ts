import { ProviderQuotaError } from './ProviderLimitErrors';
import { ProviderErrorOptions } from './ProviderErrors';

export class ProviderQuotaExhaustedError extends ProviderQuotaError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, options);
    this.name = 'ProviderQuotaExhaustedError';
  }
}

export class ProviderQuotaReservationError extends ProviderQuotaError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, options);
    this.name = 'ProviderQuotaReservationError';
  }
}

export class ProviderQuotaConfigurationError extends ProviderQuotaError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, options);
    this.name = 'ProviderQuotaConfigurationError';
  }
}

export class ProviderQuotaStateUnavailableError extends ProviderQuotaError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, options);
    this.name = 'ProviderQuotaStateUnavailableError';
  }
}

export class ProviderQuotaRoutingError extends ProviderQuotaError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, options);
    this.name = 'ProviderQuotaRoutingError';
  }
}
