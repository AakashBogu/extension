import { describe, it, expect } from 'vitest';
import { ClaimDeduplicationManager } from '../core/claims/registry/ClaimDeduplicationManager';
import { ClaimCandidate } from '../core/claims/ClaimTypes';

describe('Module 5: ClaimDeduplicationManager', () => {
  it('should detect duplicate claims and increment occurrence counts', () => {
    const deduplicator = new ClaimDeduplicationManager();

    const candidate: ClaimCandidate = {
      claimId: 'c1', text: 'Inflation is 5%.', normalizedText: 'Inflation is 5%.', classification: ['NUMERICAL'], verifiability: 'HIGH', detectionConfidence: 0.9, extractionConfidence: 0.9, classificationConfidence: 0.9, priority: 'HIGH', status: 'READY_FOR_VERIFICATION', entities: [], provenance: { transcriptId: 't1', segmentIds: ['s1'], sessionId: 'sess', startTime: 0, endTime: 1000, providerId: 'p', createdAt: Date.now() }, occurrenceCount: 1, firstSeenAt: Date.now(), lastSeenAt: Date.now(), createdAt: Date.now()
    };

    const first = deduplicator.processCandidate(candidate);
    expect(first.isDuplicate).toBe(false);

    const second = deduplicator.processCandidate(candidate);
    expect(second.isDuplicate).toBe(true);
    expect(second.canonical.occurrenceCount).toBe(2);
  });
});
