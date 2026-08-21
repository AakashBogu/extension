# Provider Routing Optimization & Adaptive Routing Policy - Developer Guide

```typescript
import { ProviderRoutingOptimizer } from '@core/providers/router/ProviderRoutingOptimizer';

const optimizer = new ProviderRoutingOptimizer(undefined, eventBus);
const optimizedCandidates = optimizer.optimizeCandidates(rankedCandidates, 'AI');
```
