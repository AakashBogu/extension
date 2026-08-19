# Provider Response Caching & In-Flight Request Deduplication Layer - Interfaces & Type Contracts

```typescript
export interface CacheEntry<T = unknown> {
  cacheKey: string;
  requestType: "AI" | "SEARCH";
  response: T;
  createdAt: number;
  expiresAt: number;
  lastAccessedAt: number;
  accessSeq: number;
  accessCount: number;
  approximateSize: number;
  providerId?: string;
}
```
