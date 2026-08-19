# Provider Response Caching & In-Flight Request Deduplication Layer - Public API Specifications

```typescript
export class ProviderResponseCache {
  get<T>(cacheKey: string): T | null;
  set<T>(cacheKey: string, requestType: "AI" | "SEARCH", response: T, ttlMs?: number, providerId?: string): void;
  invalidate(cacheKey: string): boolean;
  invalidateByProvider(providerId: string): number;
  invalidateByType(requestType: "AI" | "SEARCH"): number;
  clear(): void;
}

export class ProviderInFlightDeduplicator {
  execute<T>(cacheKey: string, executor: () => Promise<T>): Promise<T>;
}
```
