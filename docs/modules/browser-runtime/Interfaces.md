# Browser Runtime & Context Manager - Interfaces & Type Contracts

```typescript
export interface TabInfo {
  id: number;
  url: string;
  active: boolean;
  windowId: number;
}
export interface PageLifecycleState {
  visibility: "visible" | "hidden";
  focus: "focused" | "blurred";
  url: string;
  origin: string;
  domain: string;
}
```
