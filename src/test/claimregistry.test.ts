import { describe, it, expect } from 'vitest';
import { ClaimRegistry } from '../core/claims/registry/ClaimRegistry';
import { ClaimCandidate } from '../core/claims/ClaimTypes';

describe('Module 5: ClaimRegistry', () => {
  it('should register claims and return verifiable claims for Module 6', () => {
    const registry = new ClaimRegistry();

    const candidate: ClaimCandidate = {
      claimId: 'clm_1',
      text: 'Population is 240M.',
      normalizedText: 'Population is 240M.',
      classification: ['NUMERICAL'],
      verifiability: 'HIGH',
      detectionConfidence: 0.95,
      extractionConfidence: 0.9,
      classificationConfidence: 0.9,
      priority: 'CRITICAL',
      status: 'READY_FOR_VERIFICATION',
      entities: [],
      provenance: { transcriptId: 't1', segmentIds: ['s1'], sessionId: 'sess', startTime: 0, endTime: 1000, providerId: 'p', createdAt: Date.now() },
      occurrenceCount: 1,
      firstSeenAt: Date.now(),
      lastSeenAt: Date.now(),
      createdAt: Date.now()
    };

    registry.registerClaim(candidate);
    const verifiable = registry.getVerifiableClaims();

    expect(verifiable.length).toBe(1);
    expect(verifiable[0].claimId).toBe('clm_1');
    expect(verifiable[0].priority).toBe('CRITICAL');
  });
});
