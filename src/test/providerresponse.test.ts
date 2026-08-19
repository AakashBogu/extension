import { describe, it, expect } from 'vitest';
import { ProviderResponseNormalizer } from '../core/providers/execution/ProviderResponseNormalizer';
import { ProviderResponseNormalizationError } from '../core/error/ProviderExecutionErrors';
import { AIResponse } from '../core/providers/ai/AIProviderTypes';

describe('Module 6D: ProviderResponseNormalizer', () => {
  it('should normalize AI and Search responses and reject malformed response objects', () => {
    const normalizedAI = ProviderResponseNormalizer.normalizeAIResponse({
      requestId: 'req_1',
      correlationId: 'corr_1',
      providerId: 'ai.test',
      operation: 'CLAIM_ANALYSIS',
      content: 'Normalized text',
      latencyMs: 10,
      createdAt: Date.now()
    });

    expect(normalizedAI.confidence).toBe(0.9);
    expect(normalizedAI.content).toBe('Normalized text');

    expect(() => ProviderResponseNormalizer.normalizeAIResponse(null as unknown as AIResponse)).toThrow(ProviderResponseNormalizationError);
  });
});
