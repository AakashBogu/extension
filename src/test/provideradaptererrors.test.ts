import { describe, it, expect } from 'vitest';
import { ProviderRequestError, ProviderResponseError } from '../core/error/ProviderErrors';

describe('Module 6C: Provider Adapter Error Normalization', () => {
  it('should preserve requestId and providerId metadata in adapter errors', () => {
    const reqErr = new ProviderRequestError('HTTP 500 Server Error', {
      providerId: 'ai.openai',
      requestId: 'req_99',
      retryable: true
    });

    expect(reqErr.providerId).toBe('ai.openai');
    expect(reqErr.requestId).toBe('req_99');
    expect(reqErr.retryable).toBe(true);

    const resErr = new ProviderResponseError('Malformed JSON payload', {
      providerId: 'search.bing',
      requestId: 'req_100'
    });

    expect(resErr.providerId).toBe('search.bing');
    expect(resErr.requestId).toBe('req_100');
  });
});
