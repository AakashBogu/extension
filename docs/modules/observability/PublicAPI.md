# Observability, Logging & Diagnostics Platform - Public API Specifications

```typescript
export class Logger implements ILogger {
  trace(msg, ctx?): void;
  debug(msg, ctx?): void;
  info(msg, ctx?): void;
  warn(msg, ctx?): void;
  error(msg, err?, ctx?): void;
  fatal(msg, err?, ctx?): void;
}
export class MetricsManager {
  incrementCounter(name, value?, labels?): void;
  setGauge(name, value, labels?): void;
}
export class TraceManager {
  startSpan(name, parentSpanId?): Span;
  finishSpan(spanId, tags?): Span;
}
```
