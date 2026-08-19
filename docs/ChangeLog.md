# System Changelog

## [6.2.0-module6b] - 2026-08-19
### Added
- `AIProviderRegistry` and `SearchProviderRegistry` for provider registration, validation, enablement filtering, and teardown.
- `ProviderValidator` validating contract requirements and duplicate prevention.
- `AIProviderRouter` and `SearchProviderRouter` for capability matching, priority sorting, health filtering, and failover execution.
- `ProviderHealthManager` tracking consecutive success/failure metrics and health states (`HEALTHY`, `DEGRADED`, `UNHEALTHY`).
- `ProviderRecoveryManager` managing exponential backoff auto-recovery with bounded retry limits.
- 13 new EventBus topics (`provider.registered`, `provider.unregistered`, `provider.initialization_started`, `provider.initialization_completed`, `provider.initialization_failed`, `provider.health_changed`, `provider.recovery_started`, `provider.recovery_completed`, `provider.recovery_failed`, `provider.routing_selected`, `provider.routing_failed`, `provider.request_failed`, `provider.fallback_selected`).
- 7 unit test files across `src/test/aiproviderregistry.test.ts`, `src/test/searchproviderregistry.test.ts`, `src/test/aiproviderrouter.test.ts`, `src/test/searchproviderrouter.test.ts`, `src/test/providerhealth.test.ts`, `src/test/providerrecovery.test.ts`, and `src/test/providerrouting.test.ts` (Total 143 passing tests across 96 test suites).
- Technical documentation in `docs/modules/provider-routing/`.
