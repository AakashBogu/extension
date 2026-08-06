# System Changelog

## [1.2.0-module1c] - 2026-08-06
### Added
- Type-safe `EventBus` implementation with priority ordering (`CRITICAL`, `HIGH`, `NORMAL`, `LOW`), middleware pipeline, dead-letter queue, history buffer, and diagnostics.
- `PriorityEventQueue` supporting delayed dispatch and backpressure callbacks.
- `EventRegistry` mapping 17 system and video pipeline topics.
- `ChromeMessagingBridge` abstracting Chrome runtime, tab, and port messaging.
- Custom errors (`EventDispatchError`, `UnknownEventError`, `HandlerTimeoutError`, `MessageSerializationError`).
- 10 new unit tests across `src/test/eventbus.test.ts`, `src/test/eventqueue.test.ts`, and `src/test/messaging.test.ts` (Total 26 passing tests).
- Technical documentation in `docs/modules/event-bus/`.
