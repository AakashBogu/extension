# Provider Cooldown & Recovery Manager - Data Flow & Lifecycle

1. Provider error occurs -> 2. ProviderExecutionEngine invokes ProviderCooldownManager.recordFailure() -> 3. Evaluator classifies error and calculates backoff/Retry-After duration -> 4. Cooldown set to ACTIVE -> 5. Routers filter out provider -> 6. AdmissionController denies requests -> 7. Recovery timer expires or success occurs -> 8. Cooldown cleared.
