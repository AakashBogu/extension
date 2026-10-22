import { VerifiableClaim } from '../claims/ClaimTypes';
import { SanitizedVerificationRequest } from './VerificationTypes';
import { VerificationSanitizationError } from '../error/VerificationErrors';

export class VerificationRequestSanitizer {
  /**
   * Sanitizes an incoming VerifiableClaim into a SanitizedVerificationRequest,
   * stripping PII, transcript segment IDs, video/page metadata, speaker IDs, and DOM offsets.
   */
  public sanitizeClaim(claim: VerifiableClaim): SanitizedVerificationRequest {
    if (!claim || !claim.claimId || !claim.text) {
      throw new VerificationSanitizationError('Invalid claim object provided for sanitization');
    }

    const cleanText = this.sanitizeText(claim.text);
    const cleanNormalized = this.sanitizeText(claim.normalizedText || claim.text).toLowerCase().trim();

    const cleanEntities = (claim.entities || []).map(entity => ({
      type: entity.type || 'UNKNOWN',
      text: this.sanitizeText(entity.text)
    })).filter(e => e.text.length > 0);

    return {
      claimId: claim.claimId,
      claimText: cleanText,
      normalizedText: cleanNormalized,
      classification: [...(claim.classification || [])],
      verifiability: claim.verifiability || 'MEDIUM',
      priority: claim.priority || 'MEDIUM',
      entities: cleanEntities,
      confidence: claim.confidence ?? 0.5,
      createdAt: Date.now()
    };
  }

  /**
   * Cleans text by stripping common PII patterns, URLs, credentials, and HTML tags.
   */
  public sanitizeText(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Strip HTML/DOM tags
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    // Strip Email addresses
    cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');

    // Strip Authorization / Bearer tokens or generic API keys
    cleaned = cleaned.replace(/(bearer|token|apikey|secret|api_key|auth)\s*[:=]\s*[^\s]+/gi, '[REDACTED_CREDENTIAL]');
    cleaned = cleaned.replace(/\b(sk-[a-zA-Z0-9]{20,}|AIza[0-9A-Za-z-_]{30,})\b/g, '[REDACTED_KEY]');

    // Strip IP addresses
    cleaned = cleaned.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[REDACTED_IP]');

    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  /**
   * Sanitizes a query string prior to external search provider invocation.
   */
  public sanitizeQuery(query: string): string {
    let cleanQuery = this.sanitizeText(query);
    // Strip standalone URLs from search queries
    cleanQuery = cleanQuery.replace(/https?:\/\/[^\s]+/gi, '').replace(/\s+/g, ' ').trim();
    // Limit query length to safe maximum
    if (cleanQuery.length > 300) {
      cleanQuery = cleanQuery.substring(0, 300).trim();
    }
    return cleanQuery;
  }
}
