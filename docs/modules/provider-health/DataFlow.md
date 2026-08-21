# Provider Health, Reliability & Quota-Aware Routing Scoring - Data Flow & Lifecycle

1. Provider execution outcome recorded -> 2. ReliabilityTracker and LatencyTracker updated -> 3. Router requests provider ranking -> 4. HealthEvaluator computes health and routing scores -> 5. Candidates sorted deterministically.
