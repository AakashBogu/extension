# System Changelog

## [6.6.7-module6f7] - 2026-08-22
### Added
- Enhanced `ProviderHealthManager` with health score (0.0 to 1.0) and routing score (0.0 to 1.0) computation.
- `ProviderReliabilityTracker` tracking success/failure rates, retryable vs non-retryable failures, and consecutive counters.
- `ProviderLatencyTracker` using bounded ring buffer (200 samples max per provider) for average, p50, and p95 latencies.
- `ProviderHealthEvaluator` evaluating weighted health and deterministic candidate routing scores.
- `ProviderHealthScoringPolicy` defining scoring weights and latency thresholds.
- Integrated deterministic candidate ranking into `AIProviderRouter` and `SearchProviderRouter`.
- 5 new EventBus topics (`provider.health_updated`, `provider.health_degraded`, `provider.health_recovered`, `provider.health_unhealthy`, `provider.routing_score_updated`).
- 10 new unit test files (`providerhealthmanager.test.ts`, `providerhealthmetrics.test.ts`, `providerhealthscoring.test.ts`, `providerhealthreliability.test.ts`, `providerhealthlatency.test.ts`, `providerroutingscore.test.ts`, `providerhealthrouting.test.ts`, `providerhealthcooldown.test.ts`, `providerhealthquota.test.ts`, `providerhealthprivacy.test.ts`).
- Documentation suite in `docs/modules/provider-health/`.
