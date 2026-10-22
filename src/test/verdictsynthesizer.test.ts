import { describe, it, expect, vi } from 'vitest';
import { VerdictSynthesizer } from '../core/verification/synthesis/VerdictSynthesizer';
import { ProviderExecutionEngine } from '../core/providers/execution/ProviderExecutionEngine';
import { SanitizedVerificationRequest, RerankedEvidence, EvidenceStanceAnalysis } from '../core/verification/VerificationTypes';

describe('VerdictSynthesizer', () => {
  const mockExecuteAI = vi.fn();
  const mockExecutionEngine = {
    executeAI: mockExecuteAI
  } as unknown as ProviderExecutionEngine;

  const dummyRequest: SanitizedVerificationRequest = {
    claimId: 'claim_505',
    claimText: 'Water freezes at 0 degrees Celsius',
    normalizedText: 'water freezes at 0 degrees celsius',
    classification: ['FACTUAL', 'NUMERICAL'],
    verifiability: 'HIGH',
    priority: 'HIGH',
    entities: [{ type: 'NUMBER', text: '0' }],
    confidence: 0.95,
    createdAt: Date.now()
  };

  const evidence: RerankedEvidence = {
    evidence: {
      evidenceId: 'e1',
      claimId: 'claim_505',
      queryId: 'q1',
      title: 'Freezing Point of Water',
      url: 'https://science.org/water',
      snippet: 'At standard atmospheric pressure pure water freezes at 0°C.',
      sourceName: 'ScienceOrg',
      providerId: 'search.brave',
      retrievedAt: Date.now()
    },
    canonicalUrl: 'https://science.org/water',
    credibilityScore: 1.0,
    freshnessScore: 0.9,
    relevanceScore: 0.9,
    diversityPenalty: 1.0,
    compositeScore: 0.95,
    rank: 1,
    matchedEntities: ['0']
  };

  const stanceAnalysis: EvidenceStanceAnalysis = {
    evidenceId: 'e1',
    claimId: 'claim_505',
    stance: 'SUPPORTING',
    confidence: 0.95,
    explanation: 'Confirms 0C freezing point',
    keyQuotes: ['water freezes at 0°C']
  };

  it('synthesizes AI verdict when AI provider succeeds', async () => {
    mockExecuteAI.mockResolvedValueOnce({
      requestId: 'r1',
      correlationId: 'c1',
      providerId: 'ai.openai',
      operation: 'EVIDENCE_SUMMARY',
      content: JSON.stringify({ verdict: 'TRUE', confidenceScore: 0.98, summaryExplanation: 'Confirmed by physical law.' }),
      structuredOutput: { verdict: 'TRUE', confidenceScore: 0.98, summaryExplanation: 'Confirmed by physical law.' },
      latencyMs: 120,
      createdAt: Date.now()
    });

    const synthesizer = new VerdictSynthesizer(mockExecutionEngine);
    const verdict = await synthesizer.synthesizeVerdict(dummyRequest, [evidence], [stanceAnalysis], Date.now());

    expect(verdict.verdict).toBe('TRUE');
    expect(verdict.confidenceScore).toBe(0.98);
    expect(verdict.fallback).toBe(false);
  });

  it('falls back to rule-based weighted voting when AI provider fails', async () => {
    mockExecuteAI.mockRejectedValueOnce(new Error('AI Synthesis Failure'));

    const synthesizer = new VerdictSynthesizer(mockExecutionEngine);
    const verdict = await synthesizer.synthesizeVerdict(dummyRequest, [evidence], [stanceAnalysis], Date.now());

    expect(verdict.verdict).toBe('TRUE');
    expect(verdict.summaryExplanation).toContain('Multiple credible sources strongly support');
    expect(verdict.fallback).toBe(true);
  });
});
