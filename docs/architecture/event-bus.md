# Event Bus Architecture & Topic Definitions

## Event Bus Specification
Type-safe, pub/sub event bus supporting async topic handlers, schema validation, priority queuing, and event replay.

### Topic Catalog
- `audio.captured`: Emitted when new audio PCM chunk is captured.
- `transcript.produced`: Emitted when STT yields a timestamped text segment.
- `claim.detected`: Emitted when NLP/LLM identifies a factual claim.
- `verification.started`: Emitted when verification queue picks up a claim.
- `verdict.ready`: Emitted when verification completes with evidence citations.
- `cost.alert`: Emitted when token expenditure exceeds daily cap.
