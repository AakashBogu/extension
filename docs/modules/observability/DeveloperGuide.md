# Observability, Logging & Diagnostics Platform - Developer Guide

```typescript
import { Logger } from '@core/logger/Logger';
import { MetricsManager } from '@core/metrics/MetricsManager';

const logger = new Logger('AudioPipeline');
logger.info('VAD chunking started');

const metrics = new MetricsManager();
metrics.incrementCounter('audio_chunks_total');
```
