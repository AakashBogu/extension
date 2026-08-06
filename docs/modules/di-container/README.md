# Dependency Injection Container - Technical Overview

## Summary
Production-grade DI container supporting Singleton, Scoped, and Transient lifetimes, constructor/factory/value bindings, lazy resolution, and DFS circular dependency detection.

## Components Implemented
- `ServiceContainer`: Main implementation of `IServiceContainer`.
- `DependencyGraph`: Graph node/edge inspector with cycle detection.
- `ServiceRegistry`: Centralized module registration coordinator.
