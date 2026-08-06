# Browser Integration & End-to-End Validation - Public API Specifications

```typescript
export class BrowserIntegrationManager {
  boot(): void;
  shutdown(): void;
  getPipelineStatus(): PipelineStatus;
}
export class DeveloperValidationHarness {
  validateSite(siteName: string): { site: string; success: boolean; activeVideoId: string | null };
}
```
