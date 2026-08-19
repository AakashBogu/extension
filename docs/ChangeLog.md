# System Changelog

## [6.6.4-module6f4] - 2026-08-20
### Added
- `ProviderAdmissionController` top-level admission facade integrated into `ProviderExecutionEngine`.
- `ProviderAdmissionEvaluator` evaluating deterministic admission order (`DISABLED` -> `COOLDOWN` -> `QUOTA_EXHAUSTED` -> `RATE_LIMITED` -> `CAPACITY_EXCEEDED` -> `ALLOWED`).
- `ProviderAdmissionDecisionBuilder` constructing structured `AdmissionResult` records.
- `ProviderAdmissionPolicy` configuring admission enforcement flags.
- `ProviderAdmissionState` tracking admission counters and health status.
- 7 new EventBus topics (`provider.admission_allowed`, `provider.admission_denied`, `provider.admission_rate_limited`, `provider.admission_quota_exhausted`, `provider.admission_cooldown`, `provider.admission_capacity_exceeded`, `provider.admission_disabled`).
- 7 new unit test files (`provideradmission.test.ts`, `provideradmissionrate.test.ts`, `provideradmissionquota.test.ts`, `provideradmissioncooldown.test.ts`, `provideradmissioncapacity.test.ts`, `provideradmissiondisabled.test.ts`, `provideradmissionintegration.test.ts`).
- Documentation suite in `docs/modules/provider-admission/`.
