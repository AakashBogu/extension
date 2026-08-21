# Provider Reliability / Recovery & Circuit-Breaker Integration - Technical Overview

## Summary
In-memory metadata-only circuit breaker and reliability recovery subsystem converting repeated provider execution failures into a deterministic CLOSED -> OPEN -> HALF_OPEN -> CLOSED state machine with exponential recovery backoff and bounded recovery probes.

## Components Implemented
- `ProviderReliabilityRecoveryManager`: Facade coordinating circuit states, recovery probes, and EventBus topics.
- `ProviderCircuitEvaluator`: Evaluates failure thresholds (5 consecutive or 60% rolling rate) and state transitions.
- `ProviderCircuitPolicy`: Configurable parameters for thresholds, durations, backoff factor, and probe timeouts.
- `ProviderRecoveryProbeManager`: Bounded probe manager enforcing single concurrent probe limit in HALF_OPEN state.
- `ProviderCircuitState`: Data types (`CircuitState`, `ProviderCircuitRecord`, `ProviderCircuitSnapshot`).
