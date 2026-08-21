# Provider Routing Optimization & Adaptive Routing Policy - Technical Overview

## Summary
In-memory metadata-only adaptive provider routing optimization layer transforming 6F.7 health signals into policy-driven adaptive routing choices using EMA decay, controlled exploration, and stickiness hysteresis.

## Components Implemented
- `ProviderRoutingOptimizer`: Core optimizer evaluating candidate rankings with adaptive adjustments and fail-safe fallback.
- `ProviderAdaptiveRoutingPolicy`: Configurable policy defining EMA alpha, exploration bonus max, minimum score delta, and stickiness bonus.
- `ProviderRoutingOutcomeTracker`: Bounded rolling memory tracker (200 records max) recording outcomes and calculating EMA success rates.
- `ProviderRoutingWeights`: Normalization helper for routing component weightings.
- `ProviderRoutingDecision`: Normalized data contract defining final scores and decision rationale.
