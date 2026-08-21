# System Changelog

## [6.6.9-module6f9] - 2026-08-22
### Added
- `ProviderReliabilityRecoveryManager` circuit breaker facade managing `CLOSED`, `OPEN`, and `HALF_OPEN` states.
- `ProviderCircuitEvaluator` evaluating failure thresholds (5 consecutive or 60% rolling rate) and exponential backoff recovery.
- `ProviderCircuitPolicy` configuring circuit thresholds, recovery durations, and probe limits.
- `ProviderRecoveryProbeManager` enforcing single concurrent recovery probe in `HALF_OPEN` state.
- Integrated circuit breaker into `ProviderAdmissionController`, `ProviderAdmissionEvaluator`, `AIProviderRouter`, `SearchProviderRouter`, and `ProviderExecutionEngine`.
- 6 new EventBus topics (`provider.circuit_opened`, `provider.circuit_half_open`, `provider.circuit_closed`, `provider.recovery_probe_started`, `provider.recovery_probe_succeeded`, `provider.recovery_probe_failed`).
- 13 new unit test files (`providercircuitbreaker.test.ts`, `providercircuitpolicy.test.ts`, `providercircuittransition.test.ts`, `providercircuitrollingfailure.test.ts`, `providercircuitrecovery.test.ts`, `providercircuitprobe.test.ts`, `providercircuitadmission.test.ts`, `providercircuitrouting.test.ts`, `providercircuitcooldown.test.ts`, `providercircuithealth.test.ts`, `providercircuitoutcome.test.ts`, `providercircuitprivacy.test.ts`, `providercircuitintegration.test.ts`).
- Documentation suite in `docs/modules/provider-reliability-recovery/`.
