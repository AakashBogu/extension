# Provider Admission Controller - Technical Overview

## Summary
Deterministic, metadata-only admission controller evaluating request eligibility before provider execution.

## Components Implemented
- `ProviderAdmissionController`: Top-level facade evaluating provider admission prior to execution.
- `ProviderAdmissionEvaluator`: Evaluates admission in strict deterministic order (DISABLED -> COOLDOWN -> QUOTA_EXHAUSTED -> RATE_LIMITED -> CAPACITY_EXCEEDED -> ALLOWED).
- `ProviderAdmissionDecisionBuilder`: Constructs structured AdmissionResult objects.
- `ProviderAdmissionPolicy`: Configures enforcement flags and warning thresholds.
- `ProviderAdmissionState`: Tracks admission statistics and health status.
