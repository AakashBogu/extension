# System Changelog

## [6.6.6-module6f6] - 2026-08-21
### Added
- `ProviderQuotaManager` top-level quota facade integrated into `ProviderExecutionEngine`, `ProviderAdmissionController`, and routers.
- `ProviderQuotaEvaluator` calculating quota utilization ratios and window reset timestamps.
- `ProviderQuotaSnapshotBuilder` constructing normalized `ProviderQuotaState` snapshots.
- `ProviderQuotaReservationManager` managing thread-safe in-flight request reservations.
- `ProviderQuotaRoutingPolicy` configuring candidate exclusion for routers.
- `ProviderQuotaErrors` custom error hierarchy.
- 8 new EventBus topics (`provider.quota_updated`, `provider.quota_warning`, `provider.quota_critical`, `provider.quota_exhausted`, `provider.quota_reset`, `provider.quota_reservation_created`, `provider.quota_reservation_released`, `provider.quota_reservation_committed`).
- 8 new unit test files (`providerquotamanager.test.ts`, `providerquotaevaluator.test.ts`, `providerquotasnapshot.test.ts`, `providerquotarouting.test.ts`, `providerquotareservation.test.ts`, `providerquotaintegration.test.ts`, `providerquotaexhaustion.test.ts`, `providerquotarecovery.test.ts`).
- Documentation suite in `docs/modules/provider-quota/`.
