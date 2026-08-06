# Dependency Injection Architecture

## Container Design
Provides Inversify-style container supporting constructor injection, service lifetime bindings (`Singleton`, `Transient`, `Scoped`), and interface token bindings.

```typescript
export interface IServiceContainer {
  bind<T>(serviceIdentifier: Symbol): IBindingSyntax<T>;
  get<T>(serviceIdentifier: Symbol): T;
  resolve<T>(target: Constructor<T>): T;
}
```
