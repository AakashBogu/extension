# Application Kernel - Interfaces & Type Contracts

```typescript
export interface RuntimeMetadata {
  readonly instanceId: string;
  readonly version: string;
  readonly env: string;
  readonly startTime: number;
}
```
