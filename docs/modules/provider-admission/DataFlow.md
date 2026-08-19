# Provider Admission Controller - Data Flow & Lifecycle

1. Request passes cache & deduplication -> 2. ProviderExecutionEngine invokes ProviderAdmissionController.evaluate() -> 3. Evaluator checks DISABLED, COOLDOWN, QUOTA, RATE_LIMIT, CAPACITY -> 4. Returns AdmissionResult -> 5. If ALLOWED, proceeds to provider execution; if denied, throws ProviderAdmissionError.
