# Application Kernel - Public API Specifications

```typescript
export class ApplicationKernel {
  boot(): Promise<ApplicationContext>;
  shutdown(): Promise<void>;
  getContext(): ApplicationContext | null;
}
```
