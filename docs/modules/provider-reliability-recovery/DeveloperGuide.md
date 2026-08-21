# Provider Reliability / Recovery & Circuit-Breaker Integration - Developer Guide

```typescript
import { ProviderReliabilityRecoveryManager } from '@core/providers/recovery/ProviderReliabilityRecoveryManager';

const recoveryManager = new ProviderReliabilityRecoveryManager(eventBus);
const state = recoveryManager.getCircuitState('ai.openai');
```
