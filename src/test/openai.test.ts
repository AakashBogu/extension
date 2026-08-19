import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAIProvider } from '../core/providers/adapters/ai/OpenAIProvider';
import { ProviderRequestError, ProviderResponseError } from '../core/error/ProviderErrors';

describe('Module 6C: OpenAIProvider Adapter', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should initialize and process AI analyze request with mock fetch response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'chatcmpl-123',
        choices: [{ message: { content: 'GDP grew by 2.4%' } }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
      })
    } as unknown as Response);

    const provider = new OpenAIProvider({
      enabled: true,
      endpoint: 'https://api.openai.com/v1',
      model: 'gpt-4o',
      timeoutMs: 5000,
      priority: 10
    });

    await provider.initialize();
    const response = await provider.analyze({
      requestId: 'req_1',
      correlationId: 'corr_1',
      operation: 'CLAIM_ANALYSIS',
      input: 'Analyze GDP claim',
      createdAt: Date.now()
    });

    expect(response.providerId).toBe('ai.openai');
    expect(response.content).toBe('GDP grew by 2.4%');
    expect(response.tokenUsage?.totalTokens).toBe(15);
  });

  it('should throw ProviderRequestError on HTTP 401 Unauthorized', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'Invalid API key'
    } as unknown as Response);

    const provider = new OpenAIProvider({
      enabled: true,
      endpoint: 'https://api.openai.com/v1',
      model: 'gpt-4o',
      timeoutMs: 5000,
      priority: 10
    });

    await provider.initialize();
    await expect(provider.analyze({
      requestId: 'req_2',
      correlationId: 'corr_2',
      operation: 'CLAIM_ANALYSIS',
      input: 'test',
      createdAt: Date.now()
    })).rejects.toThrow(ProviderRequestError);
  });

  it('should throw ProviderResponseError on empty output content', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] })
    } as unknown as Response);

    const provider = new OpenAIProvider({
      enabled: true,
      endpoint: 'https://api.openai.com/v1',
      model: 'gpt-4o',
      timeoutMs: 5000,
      priority: 10
    });

    await provider.initialize();
    await expect(provider.analyze({
      requestId: 'req_3',
      correlationId: 'corr_3',
      operation: 'CLAIM_ANALYSIS',
      input: 'test',
      createdAt: Date.now()
    })).rejects.toThrow(ProviderResponseError);
  });
});
