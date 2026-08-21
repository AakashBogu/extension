# System Changelog

## [6.6.5-module6f5] - 2026-08-20
### Added
- `ProviderCooldownManager` top-level cooldown facade integrated into `ProviderExecutionEngine`, `ProviderAdmissionController`, and routers.
- `ProviderCooldownEvaluator` calculating exponential backoff and Retry-After normalization.
- `ProviderCooldownPolicy` configuring base/max durations, backoff factor, and failure trigger flags.
- `ProviderCooldownRecoveryManager` handling cooldown timers and recovery scheduling.
- `ExtendedProviderCooldownState` data contract.
- 7 new EventBus topics (`provider.cooldown_started`, `provider.cooldown_extended`, `provider.cooldown_expired`, `provider.cooldown_recovery_started`, `provider.cooldown_recovery_succeeded`, `provider.cooldown_recovery_failed`, `provider.cooldown_cleared`).
- 8 new unit test files (`providercooldownmanager.test.ts`, `providercooldownevaluator.test.ts`, `providercooldownpolicy.test.ts`, `providercooldownrecovery.test.ts`, `providercooldownbackoff.test.ts`, `providercooldownretryafter.test.ts`, `providercooldownadmission.test.ts`, `providercooldownexecution.test.ts`).
- Documentation suite in `docs/modules/provider-cooldown/`.
