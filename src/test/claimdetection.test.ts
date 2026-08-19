import { describe, it, expect, beforeEach } from 'vitest';
import { ClaimDetectionEngine } from '../core/claims/ClaimDetectionEngine';
import { EventBus } from '../core/events/EventBus';
import { TranscriptSegmentRecord } from '../core/speech/transcript/TranscriptTypes';

describe('Module 5: ClaimDetectionEngine Integration', () => {
  let engine: ClaimDetectionEngine;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    engine = new ClaimDetectionEngine(
      {
        enabled: true,
        minConfidenceThreshold: 0.5,
        windowDurationMs: 10000,
        maxPendingClaims: 100,
        deduplicationEnabled: true,
        providerPreference: ['null-claim-provider'],
        autoPrioritize: true
      },
      eventBus
    );
  });

  it('should run claim detection engine, ingest transcript segments, extract factual claims, and prepare VerifiableClaims for Module 6', async () => {
    let candidateDetectedEvent = false;
    let readyForVerificationEvent = false;

    eventBus.subscribe('claim.candidate_detected', () => { candidateDetectedEvent = true; });
    eventBus.subscribe('claim.ready_for_verification', () => { readyForVerificationEvent = true; });

    await engine.initialize();
    await engine.start();
    expect(engine.getStatus()).toBe('RUNNING');

    const segment: TranscriptSegmentRecord = {
      segmentId: 'seg_1',
      sessionId: 'sess_100',
      text: 'Inflation fell by five percent last year in 2024.',
      startTime: 1000,
      endTime: 2000,
      confidence: 0.95,
      language: 'en-US',
      providerId: 'null-provider',
      sequenceNumber: 1,
      createdAt: Date.now(),
      isFinal: true
    };

    const candidates = engine.processTranscriptSegment(segment);

    expect(candidates.length).toBe(1);
    expect(candidateDetectedEvent).toBe(true);
    expect(readyForVerificationEvent).toBe(true);

    const verifiableClaims = engine.getVerifiableClaims();
    expect(verifiableClaims.length).toBe(1);
    expect(verifiableClaims[0].normalizedText).toBe('Inflation fell by 5% last year in 2024.');
    expect(verifiableClaims[0].verifiability).toBe('HIGH');
    expect(verifiableClaims[0].priority).toBe('CRITICAL');

    await engine.stop();
    expect(engine.getStatus()).toBe('STOPPED');
  });
});
