import { describe, it, expect } from 'vitest';
import { VerificationRequestSanitizer } from '../core/verification/VerificationRequestSanitizer';
import { VerifiableClaim } from '../core/claims/ClaimTypes';

describe('VerificationRequestSanitizer', () => {
  const sanitizer = new VerificationRequestSanitizer();

  it('sanitizes VerifiableClaim stripping HTML, emails, and credentials', () => {
    const claim: VerifiableClaim = {
      claimId: 'claim_101',
      text: 'NASA announced <b>water on Mars</b>. Contact john.doe@example.com with bearer: secret123 key.',
      normalizedText: 'NASA announced water on Mars. Contact john.doe@example.com with bearer: secret123 key.',
      classification: ['FACTUAL'],
      verifiability: 'HIGH',
      confidence: 0.9,
      priority: 'HIGH',
      entities: [
        { entityId: 'e1', text: 'NASA', type: 'ORGANIZATION', startOffset: 0, endOffset: 4, confidence: 1 },
        { entityId: 'e2', text: 'Mars', type: 'LOCATION', startOffset: 15, endOffset: 19, confidence: 1 }
      ],
      provenance: {
        transcriptId: 'tx_1',
        segmentIds: ['seg_1'],
        sessionId: 'sess_1',
        startTime: 10,
        endTime: 20,
        providerId: 'web_speech',
        createdAt: Date.now()
      },
      timestamps: { startTime: 10, endTime: 20 },
      occurrenceCount: 1
    };

    const sanitized = sanitizer.sanitizeClaim(claim);

    expect(sanitized.claimId).toBe('claim_101');
    expect(sanitized.claimText).not.toContain('<b>');
    expect(sanitized.claimText).not.toContain('john.doe@example.com');
    expect(sanitized.claimText).toContain('[REDACTED_EMAIL]');
    expect(sanitized.claimText).toContain('[REDACTED_CREDENTIAL]');
    expect(sanitized.entities).toHaveLength(2);
    expect(sanitized.entities[0].text).toBe('NASA');
  });

  it('sanitizes standalone query strings stripping URLs and credentials', () => {
    const rawQuery = '  Check https://api.example.com/search?q=test with bearer: 12345 token  ';
    const clean = sanitizer.sanitizeQuery(rawQuery);
    expect(clean).not.toContain('12345');
    expect(clean).not.toContain('https://api.example.com');
    expect(clean).toContain('[REDACTED_CREDENTIAL]');
  });

  it('redacts sk- API keys and AIza Google keys', () => {
    const raw = 'Key is sk-abcdefghijklmnopqrstuvwxyz12345 and AIzaSyD9ABCDEF1234567890abcdefghijklm';
    const clean = sanitizer.sanitizeText(raw);
    expect(clean).not.toContain('sk-abcdefghijklmnopqrstuvwxyz12345');
    expect(clean).not.toContain('AIzaSyD9ABCDEF1234567890abcdefghijklm');
    expect(clean).toContain('[REDACTED_KEY]');
  });
});
