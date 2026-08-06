# Configuration & Feature Flags Platform - Developer Guide

```typescript
import { ConfigurationManager } from '@core/config/ConfigurationManager';
import { FeatureFlagManager } from '@core/config/FeatureFlagManager';

const cfgManager = new ConfigurationManager();
await cfgManager.loadConfig();

const flagManager = new FeatureFlagManager();
if (flagManager.isEnabled('beta_ocr')) {
  // Execute feature
}
```
