import { describe, it, expect } from 'vitest';
import { ProviderRetryManager } from '../core/providers/execution/ProviderRetryManager';
import { ProviderRequestError, ProviderConfigurationError } from '../core/error/ProviderErrors';

describe('Module 6D: ProviderRetryManager', () => {
  it('should retry retryable errors and reject non-retryable configuration errors', () => {
    const retryManager = new ProviderRetryManager(3, 10, 100);

    const retryableError = new ProviderRequestError('Timeout', { retryable: true });
    expect(retryManager.shouldRetry(retryableError, 1)).toBe(true);

    const configError = new ProviderConfigurationError('Missing key');
    expect(retryManager.shouldRetry(configError, 1)).toBe(false);

    expect(retryManager.shouldRetry(retryableError, 3)).toBe(false);
  });
});
