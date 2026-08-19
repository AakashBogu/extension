# Real-Time Claim Detection & Extraction Engine - Developer Guide

```typescript
import { ClaimDetectionEngine } from '@core/claims/ClaimDetectionEngine';

const engine = new ClaimDetectionEngine(config, eventBus, stateStore);
const candidates = engine.processTranscriptSegment(segment);
const verifiable = engine.getVerifiableClaims();

console.log('Verifiable claims ready for Module 6:', verifiable);
```
