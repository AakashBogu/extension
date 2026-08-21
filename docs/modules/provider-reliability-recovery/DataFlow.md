# Provider Reliability / Recovery & Circuit-Breaker Integration - Data Flow & Lifecycle

1. Provider execution failure recorded -> 2. Evaluator checks failureThreshold (5) or rollingFailureRate (60%) -> 3. Circuit enters OPEN -> 4. Routers and AdmissionController block normal requests -> 5. Open timer expires -> 6. Circuit enters HALF_OPEN -> 7. Single probe attempt -> 8. Success closes circuit / failure reopens with exponential backoff.
