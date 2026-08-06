# Dependency Injection Container - Architecture Blueprint

```mermaid
graph TD
  SC[ServiceContainer] --> BindingMap[Bindings Map]
  SC --> DG[DependencyGraph]
  SC --> ChildScope[Child Scoped Container]
```
