# Dependency Injection Container - Interfaces & Type Contracts

```typescript
export type ServiceLifetime = "singleton" | "scoped" | "transient";
export type ServiceIdentifier<T = unknown> = string | symbol | (new (...args: unknown[]) => T);
```
