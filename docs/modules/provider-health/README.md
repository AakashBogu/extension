# Provider Health, Reliability & Quota-Aware Routing Scoring - Technical Overview

## Summary
In-memory metadata-only provider health and reliability scoring layer producing normalized health and routing scores for AI and Search routers.

## Components Implemented
- `ProviderHealthManager`: Enhanced facade ranking providers and managing health state.
- `ProviderReliabilityTracker`: Tracks success/failure rates, retryable vs non-retryable failures, and consecutive counters.
- `ProviderLatencyTracker`: Fixed-size ring buffer tracking average, p50, and p95 latencies.
- `ProviderHealthEvaluator`: Calculates weighted health (0.0 to 1.0) and routing scores (0.0 to 1.0).
- `ProviderHealthScoringPolicy`: Configurable weights and latency/degraded thresholds.
