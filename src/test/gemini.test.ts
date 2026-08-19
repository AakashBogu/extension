import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiProvider } from '../core/providers/adapters/ai/GeminiProvider';
import { ProviderRequestError } from '../core/error/ProviderErrors';

describe('Module 6C: GeminiProvider Adapter', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should process Gemini analyze request with mock fetch response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Gemini analysis output' }] } }],
        usageMetadata: { promptTokenCount: 12, candidatesTokenCount: 8, totalTokenCount: 20 }
      })
    } as unknown as Response);

    const provider = new GeminiProvider({
      enabled: true,
      endpoint: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-1.5-pro',
      timeoutMs: 5000,
      priority: 10
    });

    await provider.initialize();
    const response = await provider.analyze({
      requestId: 'gem_1',
      correlationId: 'corr_gem_1',
      operation: 'CLAIM_ANALYSIS',
      input: 'Analyze claim',
      createdAt: Date.now()
    });

    expect(response.providerId).toBe('ai.gemini');
    expect(response.content).toBe('Gemini analysis output');
    expect(response.tokenUsage?.totalTokens).toBe(20);
  });

  it('should handle rate limit 429 error and flag retryable', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: async () => 'Rate limit exceeded'
    } as unknown as Response);

    const provider = new GeminiProvider({
      enabled: true,
      endpoint: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-1.5-pro',
      timeoutMs: 5000,
      priority: 10
    });

    await provider.initialize();
    try {
      await provider.analyze({
        requestId: 'gem_rate',
        correlationId: 'corr_gem_rate',
        operation: 'CLAIM_ANALYSIS',
        input: 'test',
        createdAt: Date.now()
      });
      expect.fail('Should have thrown ProviderRequestError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ProviderRequestError);
      if (err instanceof ProviderRequestError) {
        expect(err.retryable).toBe(true);
      }
    }
  });
});
