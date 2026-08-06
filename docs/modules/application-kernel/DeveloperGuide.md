# Application Kernel - Developer Guide

```typescript
import { ApplicationKernel } from '@core/kernel/ApplicationKernel';

const kernel = new ApplicationKernel();
const context = await kernel.boot();

context.stateManager.setState({ status: 'CAPTURING' });
```
