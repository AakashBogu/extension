# Application Kernel - Technical Overview

## Summary
Central runtime bootstrapper and orchestrator managing service startup, DI resolution, event bus initialization, state hydration, and clean shutdown.

## Components Implemented
- `ApplicationKernel`: Bootstrapper and lifecycle manager.
- `ApplicationContext`: Unified context exposing DI container, EventBus, Config, Logger, StateManager, PluginManager, ProviderRegistries, and RuntimeMetadata.
