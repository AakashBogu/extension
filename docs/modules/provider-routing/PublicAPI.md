# AI & Search Provider Registries & Routing Layer - Public API Specifications

```typescript
export class AIProviderRegistry {
  register(provider: IAIProvider): Promise<void>;
  unregister(providerId: string): Promise<void>;
  get(providerId: string): IAIProvider | undefined;
  getEnabled(): IAIProvider[];
  clear(): void;
}

export class AIProviderRouter {
  selectProvider(request: AIRequest): IAIProvider;
  executeWithFallback(request: AIRequest): Promise<AIResponse>;
}
```
