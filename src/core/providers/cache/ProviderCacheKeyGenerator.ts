import { AIRequest } from '../ai/AIProviderTypes';
import { SearchRequest } from '../search/SearchProviderTypes';
import { ProviderCacheKeyError } from '../../error/ProviderCacheErrors';

export class ProviderCacheKeyGenerator {
  static generateAIKey(request: AIRequest): string {
    if (!request || !request.operation) {
      throw new ProviderCacheKeyError('Invalid AI request for cache key generation');
    }

    const normalizedInput = typeof request.input === 'string'
      ? request.input.trim().toLowerCase().replace(/s+/g, ' ')
      : JSON.stringify(request.input, Object.keys(request.input || {}).sort());

    const systemText = (request.systemInstructions || '').trim().toLowerCase();
    const temp = typeof request.temperature === 'number' ? request.temperature.toFixed(2) : 'default';

    return `ai:${request.operation}:${normalizedInput}:${systemText}:${temp}`;
  }

  static generateSearchKey(request: SearchRequest): string {
    if (!request || !request.query) {
      throw new ProviderCacheKeyError('Invalid Search request for cache key generation');
    }

    const normalizedQuery = request.query.trim().toLowerCase().replace(/s+/g, ' ');
    const count = request.maxResults || 10;
    const lang = (request.language || 'any').toLowerCase();
    const region = (request.region || 'any').toLowerCase();
    const safe = request.safeSearch !== false ? 'safe' : 'raw';

    return `search:${normalizedQuery}:${count}:${lang}:${region}:${safe}`;
  }
}
