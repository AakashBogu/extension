# Plugin Architecture Framework - Interfaces & Type Contracts

```typescript
export interface IExtendedPlugin extends IPlugin {
  start?(): Promise<void>;
  stop?(): Promise<void>;
  capabilities?: string[];
  dependencies?: string[];
}
```
