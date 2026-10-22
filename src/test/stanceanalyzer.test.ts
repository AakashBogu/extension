import { describe, it, expect, vi } from 'vitest';
import { StanceAnalyzer } from '../core/verification/stance/StanceAnalyzer';
import { ProviderExecutionEngine } from '../core/providers/execution/ProviderExecutionEngine';
import { RerankedEvidence, SanitizedVerificationRequest } from '../core/verification/VerificationTypes';

describe('StanceAnalyzer', () => {
  const mockExecuteAI = vi.fn();
  const mockExecutionEngine = {
    executeAI: mockExecuteAI
  } as unknown as ProviderExecutionEngine;

  const dummyRequest: SanitizedVerificationRequest = {
    claimId: 'claim_404',
    claimText: 'Vaccines cause autism',
    normalizedText: 'vaccines cause autism',
    classification: ['FACTUAL'],
    verifiability: 'HIGH',
    priority: 'HIGH',
    entities: [{ type: 'PRODUCT', text: 'Vaccines' }],
    confidence: 0.9,
    createdAt: Date.now()
  };

  const evidenceItem: RerankedEvidence = {
    evidence: {
      evidenceId: 'ev_1',
      claimId: 'claim_404',
      queryId: 'q1',
      title: 'CDC Debunks Vaccine Myth',
      url: 'https://cdc.gov/vaccines',
      snippet: 'Extensive scientific studies refute any link between vaccines and autism.',
      sourceName: 'CDC',
      providerId: 'search.brave',
      retrievedAt: Date.now()
    },
    canonicalUrl: 'https://cdc.gov/vaccines',
    credibilityScore: 1.0,
    freshnessScore: 0.9,
    relevanceScore: 0.9,
    diversityPenalty: 1.0,
    compositeScore: 0.95,
    rank: 1,
    matchedEntities: ['Vaccines']
  };

  it('classifies stance via AI provider when available', async () => {
    mockExecuteAI.mockResolvedValueOnce({
      requestId: 'r1',
      correlationId: 'c1',
      providerId: 'ai.openai',
      operation: 'CLAIM_ANALYSIS',
      content: JSON.stringify({ stance: 'REFUTING', confidence: 0.95, explanation: 'CDC study refutes link', keyQuotes: ['studies refute any link'] }),
      structuredOutput: { stance: 'REFUTING', confidence: 0.95, explanation: 'CDC study refutes link', keyQuotes: ['studies refute any link'] },
      latencyMs: 100,
      createdAt: Date.now()
    });

    const analyzer = new StanceAnalyzer(mockExecutionEngine);
    const stances = await analyzer.analyzeStances([evidenceItem], dummyRequest);

    expect(stances).toHaveLength(1);
    expect(stances[0].stance).toBe('REFUTING');
    expect(stances[0].confidence).toBe(0.95);
  });

  it('falls back to rule-based heuristic stance analysis when AI fails', async () => {
    mockExecuteAI.mockRejectedValueOnce(new Error('AI execution failed'));

    const analyzer = new StanceAnalyzer(mockExecutionEngine);
    const stances = await analyzer.analyzeStances([evidenceItem], dummyRequest);

    expect(stances).toHaveLength(1);
    expect(stances[0].stance).toBe('REFUTING'); // Detected "refute" in snippet
  });
});
