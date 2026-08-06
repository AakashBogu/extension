# Queue & Backpressure Management

Manages rate limits, dynamic concurrency, and priority deduplication:
- `TranscriptQueue`: High priority, FIFO buffer.
- `ClaimQueue`: Medium priority, sliding window deduplication.
- `VerificationQueue`: Concurrency bounded (max 3 concurrent queries).
