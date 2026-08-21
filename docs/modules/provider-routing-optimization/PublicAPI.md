# Provider Routing Optimization & Adaptive Routing Policy - Public API Specifications

```typescript
export class ProviderRoutingOptimizer {
  optimizeCandidates<T extends { id: string; priority: number; enabled?: boolean }>(
    candidates: Array<{ provider: T; score: EligibleCandidateScore | ProviderRoutingScore }>,
    requestType: "AI" | "SEARCH",
    policyConfig?: ProviderAdaptiveRoutingPolicy
  ): Array<{ provider: T; decision: ProviderRoutingDecision }>;
}
```
