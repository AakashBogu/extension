# Event Bus Infrastructure - Public API Specifications

```typescript
export class EventBus implements IEventBus {
  publish<T>(topic: EventTopic, payload: T, metadata?: Record<string, unknown>): Promise<void>;
  subscribe<T>(topic: EventTopic, handler: EventHandler<T>): () => void;
  subscribeWithOptions<T>(topic: EventTopic, handler: EventHandler<T>, options?: SubscriptionOptions): () => void;
  use(middleware: EventMiddleware): void;
  getDeadLetterQueue(): BaseEvent[];
  getHistory(): BaseEvent[];
}
```
