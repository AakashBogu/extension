# AI & Search Provider Abstraction Layer — Provider Contracts - Interfaces & Type Contracts

```typescript
export interface SearchRequest {
  requestId: string;
  correlationId: string;
  query: string;
  maxResults: number;
  language?: string;
  region?: string;
  safeSearch?: boolean;
  timeoutMs?: number;
  createdAt: number;
}

export interface AIRequest {
  requestId: string;
  correlationId: string;
  operation: AIOperationType;
  input: string | Record<string, unknown>;
  systemInstructions?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  createdAt: number;
}
```
