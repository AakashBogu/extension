# AI & Search Provider Abstraction Layer — Provider Contracts - Public API Specifications

```typescript
export interface ISearchProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType;
  readonly capabilities: SearchProviderCapabilities;
  readonly priority: number;
  readonly enabled: boolean;
  initialize(): Promise<void>;
  search(request: SearchRequest): Promise<SearchResponse>;
  healthCheck(): Promise<SearchProviderHealth>;
  destroy(): void;
}

export interface IAIProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType;
  readonly capabilities: AIProviderCapabilities;
  readonly priority: number;
  readonly enabled: boolean;
  initialize(): Promise<void>;
  analyze(request: AIRequest): Promise<AIResponse>;
  healthCheck(): Promise<AIProviderHealth>;
  destroy(): void;
}
```
