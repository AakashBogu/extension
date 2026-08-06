# Event Bus Infrastructure - Technical Overview

## Summary
Production-grade type-safe event bus supporting async/sync handlers, priority execution, middleware pipelines, dead-letter queues, history buffering, and cancellation.

## Components Implemented
- `EventBus`: Concrete implementation of `IEventBus`.
- `MiddlewarePipeline`: Pre-execution middleware chain.
- `EventRegistry`: Schema & topic catalog.
- `PriorityEventQueue`: Bounded priority queue with backpressure hooks.
