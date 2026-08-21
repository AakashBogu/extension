# Provider Quota Manager & Routing Integration - Technical Overview

## Summary
In-memory metadata-only quota management subsystem enforcing daily/monthly provider quotas and integrating with routers, admission controllers, and execution engines.

## Components Implemented
- `ProviderQuotaManager`: Main facade evaluating provider quota allocations and reservations.
- `ProviderQuotaEvaluator`: Calculates quota consumption, utilization ratios, and window reset timestamps.
- `ProviderQuotaSnapshotBuilder`: Constructs normalized ProviderQuotaState snapshots.
- `ProviderQuotaReservationManager`: Thread-safe reservation manager for in-flight requests.
- `ProviderQuotaRoutingPolicy`: Defines quota-aware candidate selection rules for routers.
- `ProviderQuotaErrors`: Custom error hierarchy for quota failures.
