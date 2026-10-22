import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerificationEngine } from '../core/verification/VerificationEngine';
import { ProviderExecutionEngine } from '../core/providers/execution/ProviderExecutionEngine';
import { EventBus } from '../core/events/EventBus';
import { VerifiableClaim } from '../core/claims/ClaimTypes';

describe('VerificationEngine Integration', () => {
  let mockExecuteAI: ReturnType<typeof vi.fn>;
  let mockExecuteSearch: ReturnType<typeof vi.fn>;
  let mockExecutionEngine: ProviderExecutionEngine;
  let eventBus: EventBus;
  let engine: VerificationEngine;

  const dummyClaim: VerifiableClaim = {
    claimId: 'claim_e2e_101',
    text: 'Moon is Earth natural satellite',
    normalizedText: 'moon is earth natural satellite',
    classification: ['FACTUAL'],
    verifiability: 'HIGH',
    confidence: 0.95,
    priority: 'HIGH',
    entities: [{ entityId: 'e1', text: 'Moon', type: 'LOCATION', startOffset: 0, endOffset: 4, confidence: 1 }],
    provenance: {
      transcriptId: 't1',
      segmentIds: ['s1'],
      sessionId: 'sess1',
      startTime: 0,
      endTime: 5,
      providerId: 'web_speech',
      createdAt: Date.now()
    },
    timestamps: { startTime: 0, endTime: 5 },
    occurrenceCount: 1
  };

  beforeEach(() => {
    mockExecuteAI = vi.fn().mockImplementation((req: { operation: string; requestId: string; correlationId: string }) => {
      if (req.operation === 'QUERY_GENERATION') {
        return Promise.resolve({
          requestId: req.requestId,
          correlationId: req.correlationId,
          providerId: 'ai.openai',
          content: JSON.stringify([{ queryText: 'Moon Earth satellite', type: 'KEYWORD' }]),
          structuredOutput: { queries: [{ queryText: 'Moon Earth satellite', type: 'KEYWORD' }] },
          latencyMs: 50,
          createdAt: Date.now()
        });
      }
      if (req.operation === 'CLAIM_ANALYSIS') {
        return Promise.resolve({
          requestId: req.requestId,
          correlationId: req.correlationId,
          providerId: 'ai.openai',
          content: JSON.stringify({ stance: 'SUPPORTING', confidence: 0.95, explanation: 'Confirmed' }),
          structuredOutput: { stance: 'SUPPORTING', confidence: 0.95, explanation: 'Confirmed' },
          latencyMs: 50,
          createdAt: Date.now()
        });
      }
      return Promise.resolve({
        requestId: req.requestId,
        correlationId: req.correlationId,
        providerId: 'ai.openai',
        content: JSON.stringify({ verdict: 'TRUE', confidenceScore: 0.95, summaryExplanation: 'Moon orbits Earth.' }),
        structuredOutput: { verdict: 'TRUE', confidenceScore: 0.95, summaryExplanation: 'Moon orbits Earth.' },
        latencyMs: 50,
        createdAt: Date.now()
      });
    });

    mockExecuteSearch = vi.fn().mockResolvedValue({
      requestId: 's1',
      correlationId: 'c1',
      providerId: 'search.brave',
      results: [
        { resultId: 'r1', title: 'Moon Orbit', url: 'https://nasa.gov/moon', snippet: 'The Moon is Earths only natural satellite.', sourceName: 'NASA', providerId: 'search.brave', retrievedAt: Date.now() }
      ],
      latencyMs: 80,
      createdAt: Date.now()
    });

    mockExecutionEngine = {
      executeAI: mockExecuteAI,
      executeSearch: mockExecuteSearch
    } as unknown as ProviderExecutionEngine;

    eventBus = new EventBus();
    engine = new VerificationEngine(mockExecutionEngine, undefined, eventBus);
  });

  it('initializes and starts the Verification Engine state machine', async () => {
    expect(engine.getStatus()).toBe('IDLE');
    await engine.initialize();
    expect(engine.getStatus()).toBe('READY');

    engine.start();
    expect(engine.getStatus()).toBe('RUNNING');
  });

  it('executes full verification pipeline end-to-end and returns FactCheckVerdict', async () => {
    await engine.initialize();
    engine.start();

    const publishSpy = vi.spyOn(eventBus, 'publish');
    const verdict = await engine.verifyClaim(dummyClaim);

    expect(verdict).toBeDefined();
    expect(verdict.verdict).toBe('TRUE');
    expect(verdict.claimId).toBe('claim_e2e_101');
    expect(verdict.topEvidence).toHaveLength(1);
    expect(publishSpy).toHaveBeenCalledWith('verdict.ready', expect.objectContaining({
      claimId: 'claim_e2e_101'
    }));
  });

  it('handles provider failures gracefully with heuristic recovery', async () => {
    mockExecuteAI.mockRejectedValue(new Error('AI API Error'));

    await engine.initialize();
    engine.start();

    const verdict = await engine.verifyClaim(dummyClaim);

    expect(verdict).toBeDefined();
    expect(verdict.verdict).toBe('TRUE'); // Heuristic fallback verdict
    expect(verdict.fallback).toBe(true);
  });

  it('caches verdicts and returns cached result on subsequent verifications', async () => {
    await engine.initialize();
    engine.start();

    const verdict1 = await engine.verifyClaim(dummyClaim);
    expect(verdict1.cached).toBeUndefined();

    const verdict2 = await engine.verifyClaim(dummyClaim);
    expect(verdict2.cached).toBe(true);
    expect(engine.getMetrics().cacheHitRate).toBeGreaterThan(0);
  });

  it('publishes first-class lifecycle events directly to declared EventTopics', async () => {
    await engine.initialize();
    engine.start();

    const publishSpy = vi.spyOn(eventBus, 'publish');
    await engine.verifyClaim(dummyClaim);

    const emittedTopics = publishSpy.mock.calls.map(c => c[0]);
    expect(emittedTopics).toContain('verification.started');
    expect(emittedTopics).toContain('verification.query_generated');
    expect(emittedTopics).toContain('verification.evidence_fetched');
    expect(emittedTopics).toContain('verification.reranked');
    expect(emittedTopics).toContain('verification.verdict_synthesized');
    expect(emittedTopics).toContain('verdict.ready');
    expect(emittedTopics).not.toContain('system.diagnostic');
  });

  it('unsubscribes event listeners and cleans up when stopped or destroyed', async () => {
    await engine.initialize();
    engine.start();

    const stopSpy = vi.spyOn(engine.queue, 'drain');
    await engine.stop();
    expect(stopSpy).toHaveBeenCalled();
    expect(engine.getStatus()).toBe('STOPPED');

    engine.destroy();
    expect(engine.getStatus()).toBe('DESTROYED');
  });
});
