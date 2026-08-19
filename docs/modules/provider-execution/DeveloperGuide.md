# Provider Execution & Request Orchestration Engine - Developer Guide

```typescript
import { ProviderExecutionEngine } from '@core/providers/execution/ProviderExecutionEngine';

const engine = new ProviderExecutionEngine(aiRouter, searchRouter, aiRegistry, searchRegistry, healthManager);
await engine.initialize();

const aiResponse = await engine.executeAI(aiRequest);
const searchResponse = await engine.executeSearch(searchRequest);
```
