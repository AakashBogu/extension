import { AIResponse } from '../ai/AIProviderTypes';
import { SearchResponse, SearchResult } from '../search/SearchProviderTypes';
import { ProviderResponseNormalizationError } from '../../error/ProviderExecutionErrors';

export class ProviderResponseNormalizer {
  static normalizeAIResponse(response: AIResponse): AIResponse {
    if (!response || typeof response !== 'object') {
      throw new ProviderResponseNormalizationError('AI response object is null or undefined');
    }
    if (!response.requestId || typeof response.requestId !== 'string') {
      throw new ProviderResponseNormalizationError('Invalid or missing requestId in AI response');
    }
    if (!response.providerId || typeof response.providerId !== 'string') {
      throw new ProviderResponseNormalizationError('Invalid or missing providerId in AI response');
    }
    if (typeof response.content !== 'string') {
      throw new ProviderResponseNormalizationError('Invalid or missing content string in AI response');
    }

    return {
      requestId: response.requestId,
      correlationId: response.correlationId || '',
      providerId: response.providerId,
      operation: response.operation,
      content: response.content,
      structuredOutput: response.structuredOutput,
      confidence: typeof response.confidence === 'number' ? response.confidence : 0.9,
      modelName: response.modelName,
      tokenUsage: response.tokenUsage,
      latencyMs: response.latencyMs || 0,
      createdAt: response.createdAt || Date.now()
    };
  }

  static normalizeSearchResponse(response: SearchResponse): SearchResponse {
    if (!response || typeof response !== 'object') {
      throw new ProviderResponseNormalizationError('Search response object is null or undefined');
    }
    if (!response.requestId || typeof response.requestId !== 'string') {
      throw new ProviderResponseNormalizationError('Invalid or missing requestId in Search response');
    }
    if (!response.providerId || typeof response.providerId !== 'string') {
      throw new ProviderResponseNormalizationError('Invalid or missing providerId in Search response');
    }
    if (!Array.isArray(response.results)) {
      throw new ProviderResponseNormalizationError('Search response results must be an array');
    }

    const normalizedResults: SearchResult[] = response.results.map((r, idx) => ({
      resultId: r.resultId || `res_${idx}_${Date.now()}`,
      title: r.title || 'Untitled Result',
      url: r.url || '',
      snippet: r.snippet || '',
      sourceName: r.sourceName || '',
      publishedAt: r.publishedAt,
      relevanceScore: typeof r.relevanceScore === 'number' ? r.relevanceScore : 1.0,
      providerId: response.providerId,
      retrievedAt: r.retrievedAt || Date.now()
    }));

    return {
      requestId: response.requestId,
      correlationId: response.correlationId || '',
      providerId: response.providerId,
      results: normalizedResults,
      totalResults: typeof response.totalResults === 'number' ? response.totalResults : normalizedResults.length,
      latencyMs: response.latencyMs || 0,
      createdAt: response.createdAt || Date.now()
    };
  }
}
