export class ClaimNormalizer {
  normalizeClaimText(text: string): string {
    if (!text) return '';

    let normalized = text.trim().replace(/\s+/g, ' ');

    // Normalize spoken numbers and percentages
    normalized = normalized.replace(/\bfive percent\b/gi, '5%');
    normalized = normalized.replace(/\bten percent\b/gi, '10%');
    normalized = normalized.replace(/\btwenty twenty-four\b/gi, '2024');
    normalized = normalized.replace(/\btwenty twenty-five\b/gi, '2025');

    return normalized;
  }
}
