# Application Kernel - Architecture Blueprint

```mermaid
graph TD
  AK[ApplicationKernel] -->|boot()| AC[ApplicationContext]
  AC --> Container[DI Container]
  AC --> EventBus[EventBus]
  AC --> StateManager[StateManager]
  AC --> PluginManager[PluginManager]
  AC --> ProviderRegistries[AI/Search/STT/OCR/Storage Registries]
```
