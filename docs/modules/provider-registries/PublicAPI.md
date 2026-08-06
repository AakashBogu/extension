# Provider Registries Module - Public API Specifications

```typescript
export class ProviderRegistry<T> {
  register(id: string, provider: T, priority?: number): void;
  resolve(id: string): T;
  setDefault(id: string): void;
  getDefault(): T | undefined;
  listProviders(): ProviderEntry<T>[];
}
```
