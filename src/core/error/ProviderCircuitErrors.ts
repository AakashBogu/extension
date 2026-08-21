import { ProviderLimitError } from './ProviderLimitErrors';
import { ProviderErrorOptions } from './ProviderErrors';

export class ProviderCircuitOpenError extends ProviderLimitError {
  public readonly openUntil?: number;

  constructor(message: string, options?: ProviderErrorOptions & { openUntil?: number }) {
    super(message, 'ERR_PROVIDER_CIRCUIT_OPEN', options);
    this.name = 'ProviderCircuitOpenError';
    this.openUntil = options?.openUntil;
  }
}

export class ProviderRecoveryProbeRequiredError extends ProviderLimitError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_RECOVERY_PROBE_REQUIRED', options);
    this.name = 'ProviderRecoveryProbeRequiredError';
  }
}

export class ProviderRecoveryProbeInFlightError extends ProviderLimitError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_RECOVERY_PROBE_IN_FLIGHT', options);
    this.name = 'ProviderRecoveryProbeInFlightError';
  }
}
