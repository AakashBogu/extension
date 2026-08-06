# State Management Architecture - Public API Specifications

```typescript
export class GlobalStateStore {
  getState(): GlobalState;
  setState(partial): void;
  select<R>(selector: Selector<R>): R;
  subscribe(listener): () => void;
  createSnapshot(): StateSnapshot;
  restoreSnapshot(snapshot): void;
}
```
