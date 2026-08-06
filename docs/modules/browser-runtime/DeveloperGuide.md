# Browser Runtime & Context Manager - Developer Guide

```typescript
import { BrowserRuntime } from '@core/browser/BrowserRuntime';

const runtime = new BrowserRuntime(eventBus, stateStore);
const currentTab = runtime.getContext().getCurrentTab();
console.log('Active tab:', currentTab?.url);
```
