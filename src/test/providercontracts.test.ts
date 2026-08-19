import { describe, it, expect } from 'vitest';
import {
  ProviderError,
  ProviderInitializationError,
  ProviderRequestError
} from '../core/error/ProviderErrors';
import { SearchRequest, SearchResponse } from '../core/providers/search/SearchProviderTypes';
import { AIRequest, AIResponse } from '../core/providers/ai/AIProviderTypes';

describe('Module 6A: Provider Contracts & Errors', () => {
  it('should construct strongly typed SearchRequest and SearchResponse shapes', () => {
    const req: SearchRequest = {
      requestId: 'req_101',
      correlationId: 'corr_101',
      query: 'Pakistan GDP 2025',
      maxResults: 5,
      createdAt: Date.now()
    };

    const res: SearchResponse = {
      requestId: req.requestId,
      correlationId: req.correlationId,
      providerId: 'test-search-provider',
      results: [
        {
          resultId: 'res_1',
          title: 'Pakistan Economy Report',
          url: 'https://example.com/report',
          snippet: 'GDP projected at 2.4%',
          sourceName: 'Example News',
          providerId: 'test-search-provider',
          retrievedAt: Date.now()
        }
      ],
      latencyMs: 120,
      createdAt: Date.now()
    };

    expect(req.requestId).toBe('req_101');
    expect(res.results.length).toBe(1);
    expect(res.results[0].title).toBe('Pakistan Economy Report');
  });

  it('should construct strongly typed AIRequest and AIResponse shapes with supported operations', () => {
    const aiReq: AIRequest = {
      requestId: 'ai_req_1',
      correlationId: 'corr_101',
      operation: 'CLAIM_ANALYSIS',
      input: { claimText: 'GDP grew by 2.4%' },
      temperature: 0.2,
      createdAt: Date.now()
    };

    const aiRes: AIResponse = {
      requestId: aiReq.requestId,
      correlationId: aiReq.correlationId,
      providerId: 'test-ai-provider',
      operation: 'CLAIM_ANALYSIS',
      content: 'Extracted factual proposition',
      confidence: 0.95,
      latencyMs: 300,
      createdAt: Date.now()
    };

    expect(aiReq.operation).toBe('CLAIM_ANALYSIS');
    expect(aiRes.confidence).toBe(0.95);
  });

  it('should correctly build ProviderError hierarchy with retryable flags', () => {
    const baseError = new ProviderError('Base error', 'ERR_PROVIDER', { providerId: 'p1', retryable: false });
    expect(baseError.code).toBe('ERR_PROVIDER');
    expect(baseError.retryable).toBe(false);

    const reqError = new ProviderRequestError('Network timeout', { providerId: 'p1', requestId: 'r1', retryable: true });
    expect(reqError.code).toBe('ERR_PROVIDER_REQUEST');
    expect(reqError.retryable).toBe(true);
    expect(reqError.requestId).toBe('r1');

    const initError = new ProviderInitializationError('Init failed', { providerId: 'p1' });
    expect(initError.code).toBe('ERR_PROVIDER_INIT');
  });
});
