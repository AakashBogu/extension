# System Changelog

## [6.6.8-module6f8] - 2026-08-22
### Added
- `ProviderRoutingOptimizer` adaptive provider ranking facade with fail-safe fallback.
- `ProviderAdaptiveRoutingPolicy` configuring EMA decay alpha (0.15), exploration bonus max (0.05), minimum score delta (0.03), and stickiness bonus (0.02).
- `ProviderRoutingOutcomeTracker` bounded rolling memory tracker (200 records max) recording outcomes and updating EMA success rates.
- `ProviderRoutingWeights` normalizing routing weightings.
- `ProviderRoutingDecision` data contract.
- Integrated adaptive routing optimization into `AIProviderRouter`, `SearchProviderRouter`, and `ProviderExecutionEngine`.
- 5 new EventBus topics (`provider.routing_optimized`, `provider.routing_policy_updated`, `provider.routing_exploration`, `provider.routing_outcome_recorded`, `provider.routing_stability_applied`).
- 12 new unit test files (`provideradaptivepolicy.test.ts`, `providerroutingoptimizer.test.ts`, `providerroutingdecision.test.ts`, `providerroutingweights.test.ts`, `providerroutingexploration.test.ts`, `providerroutingstickiness.test.ts`, `providerroutingoutcome.test.ts`, `providerroutingadaptive.test.ts`, `providerroutingstability.test.ts`, `providerroutingprivacy.test.ts`, `providerroutingfailsafe.test.ts`, `providerroutingintegration.test.ts`).
- Documentation suite in `docs/modules/provider-routing-optimization/`.
