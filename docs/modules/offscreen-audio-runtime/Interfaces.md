# Offscreen Audio Runtime - Interfaces & Type Contracts

```typescript
export interface OffscreenMessage<T = unknown> {
  messageId: string;
  type: OffscreenMessageType;
  timestamp: number;
  source: "service-worker" | "offscreen-document";
  target: "service-worker" | "offscreen-document";
  correlationId: string;
  payload: T;
  version: string;
}
```
