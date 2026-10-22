import { SanitizedVerificationRequest, SearchQuerySpec, SearchQueryType } from '../VerificationTypes';
import { ProviderExecutionEngine } from '../../providers/execution/ProviderExecutionEngine';
import { VerificationQueryGenerationError } from '../../error/VerificationErrors';
import { AIRequest } from '../../providers/ai/AIProviderTypes';
import { VerificationRequestSanitizer } from '../VerificationRequestSanitizer';

export class VerificationQueryGenerator {
  constructor(
    private readonly executionEngine: ProviderExecutionEngine,
    private readonly sanitizer: VerificationRequestSanitizer = new VerificationRequestSanitizer()
  ) {}

  /**
   * Generates 2-4 targeted search queries from a sanitized claim request.
   * Uses ProviderExecutionEngine (QUERY_GENERATION operation) with heuristic fallback.
   */
  public async generateQueries(
    request: SanitizedVerificationRequest,
    correlationId?: string,
    abortSignal?: AbortSignal
  ): Promise<SearchQuerySpec[]> {
    if (!request || !request.claimText) {
      throw new VerificationQueryGenerationError('Invalid sanitized request provided to query generator');
    }

    const corrId = correlationId || `corr_qgen_${request.claimId}_${Date.now()}`;

    try {
      if (abortSignal?.aborted) {
        throw new VerificationQueryGenerationError('Query generation aborted prior to AI execution');
      }

      const aiRequest: AIRequest = {
        requestId: `req_qgen_${request.claimId}_${Date.now()}`,
        correlationId: corrId,
        operation: 'QUERY_GENERATION',
        input: JSON.stringify({
          claimText: this.sanitizer.sanitizeText(request.claimText),
          classification: request.classification,
          entities: request.entities.map(e => this.sanitizer.sanitizeText(e.text))
        }),
        systemInstructions:
          'Formulate up to 3 concise, highly relevant search queries to fact-check the claim. ' +
          'Return a JSON array of objects with keys: "queryText", "type" ("KEYWORD" | "ENTITY_ORIENTED" | "COUNTER_FACTUAL").',
        temperature: 0.2,
        maxTokens: 256,
        createdAt: Date.now()
      };

      const aiResponse = await this.executionEngine.executeAI(aiRequest);

      let parsedQueries: Array<{ queryText: string; type?: SearchQueryType }> = [];
      try {
        if (aiResponse.structuredOutput && Array.isArray(aiResponse.structuredOutput.queries)) {
          parsedQueries = aiResponse.structuredOutput.queries as Array<{ queryText: string; type?: SearchQueryType }>;
        } else {
          const match = aiResponse.content.match(/\[[\s\S]*\]/);
          if (match) {
            parsedQueries = JSON.parse(match[0]);
          }
        }
      } catch {
        // Fall back to rule-based parser if JSON extraction fails
      }

      if (parsedQueries.length > 0) {
        return parsedQueries
          .map((q, idx) => ({
            queryId: `q_${request.claimId}_${idx + 1}`,
            claimId: request.claimId,
            queryText: this.sanitizer.sanitizeQuery(q.queryText),
            queryType: q.type || 'KEYWORD',
            weight: idx === 0 ? 1.0 : 0.8
          }))
          .filter(q => q.queryText.length > 0);
      }
    } catch {
      // AI Provider execution failed or timed out — fall back to rule-based query generator
    }

    return this.generateHeuristicQueries(request);
  }

  /**
   * Rule-based heuristic fallback query generator.
   */
  public generateHeuristicQueries(request: SanitizedVerificationRequest): SearchQuerySpec[] {
    const specs: SearchQuerySpec[] = [];

    // Query 1: Direct claim keyword query
    const rawQ1 = request.claimText.replace(/[^\w\s]/gi, '').substring(0, 150).trim();
    specs.push({
      queryId: `q_${request.claimId}_h1`,
      claimId: request.claimId,
      queryText: this.sanitizer.sanitizeQuery(rawQ1),
      queryType: 'KEYWORD',
      weight: 1.0
    });

    // Query 2: Entity-focused query (if entities present)
    if (request.entities.length > 0) {
      const entityStr = request.entities.map(e => e.text).join(' ');
      specs.push({
        queryId: `q_${request.claimId}_h2`,
        claimId: request.claimId,
        queryText: this.sanitizer.sanitizeQuery(`${entityStr} fact check`),
        queryType: 'ENTITY_ORIENTED',
        weight: 0.9
      });
    }

    // Query 3: Counter-factual / Stance verification query
    specs.push({
      queryId: `q_${request.claimId}_h3`,
      claimId: request.claimId,
      queryText: this.sanitizer.sanitizeQuery(`is it true that ${request.claimText}`).substring(0, 150).trim(),
      queryType: 'COUNTER_FACTUAL',
      weight: 0.7
    });

    return specs.filter(s => s.queryText.length > 0);
  }
}
