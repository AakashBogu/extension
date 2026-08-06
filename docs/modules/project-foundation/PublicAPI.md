# Module 1A Public API Contracts

## Exported Infrastructure Interfaces
- `ConfigLoader`: Concrete config loader implementing `IConfigLoader`.
- `AppError`, `ConfigurationError`, `ExtensionInitializationError`: Base error classes.
- `IServiceContainer`: DI contract for Module 1B.
- `IPlugin`: Plugin contract for Module 1B.
- `IEventBus`, `BaseEvent`: Event bus contract for Module 1C.
