# Provider Admission Controller - Developer Guide

```typescript
import { ProviderAdmissionController } from '@core/providers/limits/ProviderAdmissionController';

const admissionController = new ProviderAdmissionController(rateLimitTracker, usageTracker, policy, eventBus);
await admissionController.initialize();

const result = admissionController.evaluate(request, providerId);
if (result.decision !== 'ALLOWED') {
  // Handle admission denial
}
```
