# Provider Registries Module - Interfaces & Type Contracts

```typescript
export interface ProviderEntry<T> {
  id: string;
  provider: T;
  priority: number;
}
```
