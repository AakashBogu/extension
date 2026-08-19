# Provider Admission Controller - Public API Specifications

```typescript
export class ProviderAdmissionController {
  initialize(): Promise<void>;
  evaluate(request: AIRequest | SearchRequest, providerId: string, activeConcurrentCount?: number, maxConcurrentAllowed?: number): AdmissionResult;
  canExecute(request: AIRequest | SearchRequest, providerId: string, activeConcurrentCount?: number, maxConcurrentAllowed?: number): boolean;
  getDecision(requestId: string): AdmissionResult | null;
  getStatus(): ProviderAdmissionState;
  healthCheck(): Promise<ProviderAdmissionHealth>;
  reset(): void;
  destroy(): void;
}
```
