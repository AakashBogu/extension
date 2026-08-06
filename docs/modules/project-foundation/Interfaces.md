# Module 1A Type Definitions & Interfaces

```typescript
export interface AppConfig {
  env: 'development' | 'production' | 'test';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  defaultAiProvider: string;
  defaultSearchProvider: string;
  maxTokensPerDay: number;
  enableDebugConsole: boolean;
}

export interface AppState {
  status: ServiceStatus;
  activeVideoId: string | null;
  activeTabId: number | null;
  claimsProcessedCount: number;
  lastError: string | null;
}
```
