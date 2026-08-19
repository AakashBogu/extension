# AI & Search Provider Registries & Routing Layer - Developer Guide

```typescript
import { AIProviderRegistry } from '@core/providers/registry/AIProviderRegistry';
import { ProviderHealthManager } from '@core/providers/health/ProviderHealthManager';
import { AIProviderRouter } from '@core/providers/router/AIProviderRouter';

const registry = new AIProviderRegistry(eventBus);
const health = new ProviderHealthManager(eventBus);
const router = new AIProviderRouter(registry, health, eventBus);

await registry.register(provider);
const response = await router.executeWithFallback(aiRequest);
```
