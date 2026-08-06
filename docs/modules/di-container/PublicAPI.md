# Dependency Injection Container - Public API Specifications

```typescript
export class ServiceContainer implements IServiceContainer {
  bind<T>(id: ServiceIdentifier<T>): BindingSyntax<T>;
  get<T>(id: ServiceIdentifier<T>): T;
  has<T>(id: ServiceIdentifier<T>): boolean;
  createScope(): ServiceContainer;
  getDependencyGraph(): DependencyGraph;
}
```
