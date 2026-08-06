# Browser Integration & End-to-End Validation - Interfaces & Type Contracts

```typescript
export interface PipelineStatus {
  isInitialized: boolean;
  isRunning: boolean;
  activeVideoId: string | null;
  discoveredVideosCount: number;
  healthy: boolean;
}
export interface BrowserHealthReport {
  overallHealth: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  components: Record<string, boolean>;
}
```
