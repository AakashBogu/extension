# Event Bus Infrastructure - Developer Guide

```typescript
import { EventBus } from '@core/events/EventBus';
import { ChromeMessagingBridge } from '@core/messaging/ChromeMessagingBridge';

const bus = new EventBus();
bus.subscribe('claim.detected', (evt) => {
  console.log('Claim detected:', evt.payload);
});

await bus.publish('claim.detected', { claimText: 'Sample statement' });
```
