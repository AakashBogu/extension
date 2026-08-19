import { CacheEntry } from './ProviderCacheTypes';

export class ProviderCacheEvictionManager {
  static estimateSize(obj: unknown): number {
    if (!obj) return 0;
    try {
      const str = JSON.stringify(obj);
      return str ? str.length * 2 : 100;
    } catch (_) {
      return 100;
    }
  }

  static findEvictionCandidate<T>(entries: Map<string, CacheEntry<T>>): string | null {
    if (entries.size === 0) return null;

    let oldestKey: string | null = null;
    let oldestSeq = Infinity;

    entries.forEach((entry, key) => {
      if (entry.accessSeq < oldestSeq) {
        oldestSeq = entry.accessSeq;
        oldestKey = key;
      }
    });

    return oldestKey;
  }
}
