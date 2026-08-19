# Provider Response Caching & In-Flight Request Deduplication Layer - Developer Guide

```typescript
import { ProviderResponseCache } from '@core/providers/cache/ProviderResponseCache';
import { ProviderInFlightDeduplicator } from '@core/providers/cache/ProviderInFlightDeduplicator';

const cache = new ProviderResponseCache(policy, metricsCollector, eventBus);
const deduplicator = new ProviderInFlightDeduplicator(metricsCollector, eventBus);
```
