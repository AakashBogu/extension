import { describe, it, expect, vi } from 'vitest';
import { VerificationQueryGenerator } from '../core/verification/query/VerificationQueryGenerator';
import { ProviderExecutionEngine } from '../core/providers/execution/ProviderExecutionEngine';
import { SanitizedVerificationRequest } from '../core/verification/VerificationTypes';

describe('VerificationQueryGenerator', () => {
  const mockExecuteAI = vi.fn();
  const mockExecutionEngine = {
    executeAI: mockExecuteAI
  } as unknown as ProviderExecutionEngine;

  const dummyRequest: SanitizedVerificationRequest = {
    claimId: 'claim_202',
    claimText: 'The Eiffel Tower is located in Paris France',
    normalizedText: 'the eiffel tower is located in paris france',
    classification: ['FACTUAL'],
    verifiability: 'HIGH',
    priority: 'HIGH',
    entities: [
      { type: 'LOCATION', text: 'Eiffel Tower' },
      { type: 'LOCATION', text: 'Paris' }
    ],
    confidence: 0.95,
    createdAt: Date.now()
  };

  it('formulates AI-assisted query specs when AI provider succeeds', async () => {
    mockExecuteAI.mockResolvedValueOnce({
      requestId: 'r1',
      correlationId: 'c1',
      providerId: 'ai.openai',
      operation: 'QUERY_GENERATION',
      content: JSON.stringify([
        { queryText: 'Eiffel Tower location Paris', type: 'KEYWORD' },
        { queryText: 'Is Eiffel Tower in Paris France', type: 'COUNTER_FACTUAL' }
      ]),
      structuredOutput: {
        queries: [
          { queryText: 'Eiffel Tower location Paris', type: 'KEYWORD' },
          { queryText: 'Is Eiffel Tower in Paris France', type: 'COUNTER_FACTUAL' }
        ]
      },
      latencyMs: 150,
      createdAt: Date.now()
    });

    const generator = new VerificationQueryGenerator(mockExecutionEngine);
    const queries = await generator.generateQueries(dummyRequest);

    expect(queries).toHaveLength(2);
    expect(queries[0].queryText).toContain('Eiffel Tower location Paris');
    expect(queries[0].queryType).toBe('KEYWORD');
  });

  it('falls back to rule-based heuristic queries when AI provider fails', async () => {
    mockExecuteAI.mockRejectedValueOnce(new Error('AI Rate Limit Exhausted'));

    const generator = new VerificationQueryGenerator(mockExecutionEngine);
    const queries = await generator.generateQueries(dummyRequest);

    expect(queries.length).toBeGreaterThanOrEqual(2);
    expect(queries[0].queryText).toContain('Eiffel Tower is located in Paris France');
    expect(queries[1].queryType).toBe('ENTITY_ORIENTED');
    expect(queries[1].queryText).toContain('Eiffel Tower Paris fact check');
  });
});
