# Provider Health, Reliability & Quota-Aware Routing Scoring - Developer Guide

```typescript
import { ProviderHealthManager } from '@core/providers/health/ProviderHealthManager';

const healthManager = new ProviderHealthManager(eventBus);
const ranked = healthManager.rankProviders(capableProviders, cooldownManager, quotaManager);
```
