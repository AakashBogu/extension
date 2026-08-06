# Event Bus Infrastructure - Interfaces & Type Contracts

```typescript
export type EventPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
export interface BaseEvent<T = unknown> {
  id: string;
  topic: EventTopic;
  timestamp: number;
  payload: T;
  metadata?: EventMetadata;
}
```
