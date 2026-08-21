# Provider Cooldown & Recovery Manager - Developer Guide

```typescript
import { ProviderCooldownManager } from '@core/providers/limits/ProviderCooldownManager';

const cooldownManager = new ProviderCooldownManager(policy, eventBus);
await cooldownManager.initialize();

if (cooldownManager.isInCooldown('ai.openai')) {
  // Provider in active cooldown
}
```
