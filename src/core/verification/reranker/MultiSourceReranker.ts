import { RawEvidenceItem, RerankedEvidence, SanitizedVerificationRequest } from '../VerificationTypes';

export interface RerankerPolicyConfig {
  relevanceWeight: number;
  credibilityWeight: number;
  freshnessWeight: number;
  halfLifeDays: number;
  minCredibilityThreshold: number;
  maxRankedItems: number;
}

export class MultiSourceReranker {
  private readonly config: RerankerPolicyConfig;

  // Domain authority map (static, deterministic)
  private readonly domainCredibilityMap: Record<string, number> = {
    'reuters.com': 1.0,
    'apnews.com': 1.0,
    'bbc.com': 1.0,
    'nytimes.com': 0.95,
    'washingtonpost.com': 0.95,
    'theguardian.com': 0.9,
    'wsj.com': 0.9,
    'bloomberg.com': 0.9,
    'factcheck.org': 1.0,
    'snopes.com': 1.0,
    'politifact.com': 1.0,
    'fullfact.org': 1.0,
    'gov': 1.0,
    'edu': 1.0,
    'wikipedia.org': 0.75
  };

  constructor(config?: Partial<RerankerPolicyConfig>) {
    this.config = {
      relevanceWeight: config?.relevanceWeight ?? 0.40,
      credibilityWeight: config?.credibilityWeight ?? 0.35,
      freshnessWeight: config?.freshnessWeight ?? 0.25,
      halfLifeDays: config?.halfLifeDays ?? 180,
      minCredibilityThreshold: config?.minCredibilityThreshold ?? 0.3,
      maxRankedItems: config?.maxRankedItems ?? 10
    };
  }

  /**
   * Deterministically reranks raw evidence items against a sanitized claim request.
   * Guarantees identical ranking for identical inputs + policy.
   */
  public rerank(
    rawItems: RawEvidenceItem[],
    request: SanitizedVerificationRequest
  ): RerankedEvidence[] {
    if (!rawItems || rawItems.length === 0) {
      return [];
    }

    // 1. Deduplicate by Canonical URL
    const deduplicatedMap = new Map<string, RawEvidenceItem>();
    for (const item of rawItems) {
      const canonicalUrl = this.toCanonicalUrl(item.url);
      const existing = deduplicatedMap.get(canonicalUrl);
      if (!existing || (item.snippet && item.snippet.length > (existing.snippet || '').length)) {
        deduplicatedMap.set(canonicalUrl, item);
      }
    }

    const uniqueItems = Array.from(deduplicatedMap.values());
    const domainCounts = new Map<string, number>();

    // 2. Compute Component Scores & Apply Diversity Penalty
    const scoredItems: RerankedEvidence[] = uniqueItems.map(item => {
      const canonicalUrl = this.toCanonicalUrl(item.url);
      const domain = this.extractDomain(canonicalUrl);

      // Diversity penalty
      const currentDomainCount = domainCounts.get(domain) || 0;
      domainCounts.set(domain, currentDomainCount + 1);
      let diversityPenalty = 1.0;
      if (currentDomainCount === 1) diversityPenalty = 0.6;
      else if (currentDomainCount >= 2) diversityPenalty = 0.3;

      const credibilityScore = this.computeCredibilityScore(domain);
      const freshnessScore = this.computeFreshnessScore(item.publishedAt, request.createdAt);
      const { relevanceScore, matchedEntities } = this.computeRelevanceScore(item, request);

      const compositeRaw =
        this.config.relevanceWeight * relevanceScore +
        this.config.credibilityWeight * credibilityScore +
        this.config.freshnessWeight * freshnessScore;

      const compositeScore = Number((compositeRaw * diversityPenalty).toFixed(6));

      return {
        evidence: item,
        canonicalUrl,
        credibilityScore,
        freshnessScore,
        relevanceScore,
        diversityPenalty,
        compositeScore,
        rank: 0,
        matchedEntities
      };
    });

    // 3. Filter by Minimum Credibility Threshold
    const filteredItems = scoredItems.filter(item => item.credibilityScore >= this.config.minCredibilityThreshold);

    // 4. Deterministic 3-Tier Sort
    filteredItems.sort((a, b) => {
      const scoreDiff = b.compositeScore - a.compositeScore;
      if (Math.abs(scoreDiff) >= 1e-6) {
        return scoreDiff;
      }

      // Tier 1: Higher credibility score
      const credDiff = b.credibilityScore - a.credibilityScore;
      if (Math.abs(credDiff) >= 1e-6) {
        return credDiff;
      }

      // Tier 2: Younger publishedAt timestamp
      const pubA = a.evidence.publishedAt || 0;
      const pubB = b.evidence.publishedAt || 0;
      if (pubA !== pubB) {
        return pubB - pubA;
      }

      // Tier 3: Lexicographical canonical URL comparison
      return a.canonicalUrl.localeCompare(b.canonicalUrl);
    });

    // 5. Assign Ranks & Cap to Max Ranked Items
    const topRanked = filteredItems.slice(0, this.config.maxRankedItems).map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));

    return topRanked;
  }

  /**
   * Normalizes a URL to a canonical format.
   */
  public toCanonicalUrl(urlStr: string): string {
    if (!urlStr) return '';
    try {
      const parsed = new URL(urlStr.trim());
      const keysToDelete: string[] = [];
      parsed.searchParams.forEach((_, key) => {
        if (key.startsWith('utm_') || key === 'fbclid' || key === 'gclid') {
          keysToDelete.push(key);
        }
      });
      for (const k of keysToDelete) {
        parsed.searchParams.delete(k);
      }
      parsed.hash = '';
      let pathname = parsed.pathname;
      if (pathname.length > 1 && pathname.endsWith('/')) {
        pathname = pathname.substring(0, pathname.length - 1);
      }
      const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
      const searchStr = parsed.search ? parsed.search : '';
      return `${parsed.protocol}//${hostname}${pathname}${searchStr}`;
    } catch {
      return urlStr.toLowerCase().trim();
    }
  }

  private extractDomain(urlStr: string): string {
    try {
      const parsed = new URL(urlStr);
      return parsed.hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      return 'unknown';
    }
  }

  private computeCredibilityScore(domain: string): number {
    if (this.domainCredibilityMap[domain]) {
      return this.domainCredibilityMap[domain];
    }
    if (domain.endsWith('.gov') || domain.endsWith('.edu')) {
      return 1.0;
    }
    // Check top-level domain suffix matches
    for (const [key, score] of Object.entries(this.domainCredibilityMap)) {
      if (domain.endsWith(`.${key}`)) {
        return score;
      }
    }
    return 0.5; // Default neutral credibility for unknown domains
  }

  private computeFreshnessScore(publishedAt?: number, referenceTime?: number): number {
    if (!publishedAt) return 0.5;
    const now = referenceTime || Date.now();
    const ageMs = Math.max(0, now - publishedAt);
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    const lambda = Math.LN2 / this.config.halfLifeDays;
    const score = Math.exp(-lambda * ageDays);
    return Number(Math.max(0, Math.min(1, score)).toFixed(6));
  }

  private computeRelevanceScore(
    item: RawEvidenceItem,
    request: SanitizedVerificationRequest
  ): { relevanceScore: number; matchedEntities: string[] } {
    const textToMatch = `${item.title} ${item.snippet}`.toLowerCase();
    const matchedEntities: string[] = [];

    // Entity matching
    let entityMatches = 0;
    for (const entity of request.entities) {
      if (entity.text && textToMatch.includes(entity.text.toLowerCase())) {
        entityMatches++;
        matchedEntities.push(entity.text);
      }
    }

    const entityScore = request.entities.length > 0 ? entityMatches / request.entities.length : 0.5;

    // Keyword match density
    const claimWords = request.claimText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
    let wordMatches = 0;
    for (const word of claimWords) {
      if (textToMatch.includes(word)) {
        wordMatches++;
      }
    }

    const wordScore = claimWords.length > 0 ? wordMatches / claimWords.length : 0.5;
    const relevanceScore = Number((0.6 * entityScore + 0.4 * wordScore).toFixed(6));

    return { relevanceScore, matchedEntities };
  }
}
