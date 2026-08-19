# Provider Execution & Request Orchestration Engine - Data Flow & Lifecycle

1. Client calls executeAI / executeSearch -> 2. Engine validates request & creates lifecycle record -> 3. Selects provider via router -> 4. Executes request with AbortController timeout -> 5. If retryable error occurs, retries with backoff -> 6. If provider fails, falls back to alternative provider -> 7. Normalizes response & updates metrics.
