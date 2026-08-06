# Event Bus Infrastructure - Architecture Blueprint

```mermaid
graph TD
  Publisher -->|publish(topic, payload)| EB[EventBus]
  EB --> Pipeline[Middleware Pipeline]
  Pipeline --> Handlers[Priority Ordered Handlers]
  Handlers -->|Success| History[History Buffer]
  Handlers -->|Failure / Unhandled| DLQ[Dead Letter Queue]
```
