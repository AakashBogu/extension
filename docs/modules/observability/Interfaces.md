# Observability, Logging & Diagnostics Platform - Interfaces & Type Contracts

```typescript
export interface LogEntry {
  id: string;
  timestamp: number;
  level: ExtendedLogLevel;
  message: string;
  moduleName?: string;
  context?: Record<string, unknown>;
}
export interface Span {
  traceId: string;
  spanId: string;
  name: string;
  durationMs?: number;
}
```
