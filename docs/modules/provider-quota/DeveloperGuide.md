# Provider Quota Manager & Routing Integration - Developer Guide

```typescript
import { ProviderQuotaManager } from '@core/providers/limits/ProviderQuotaManager';

const quotaManager = new ProviderQuotaManager(usageTracker, eventBus);
await quotaManager.initialize();

const handle = quotaManager.reserve('ai.openai', 1, 100);
// execute request...
handle.commit(usageRecord);
```
