# System Changelog

## [3.3.0-module3d] - 2026-08-19
### Added
- `AudioTransportEngine` top-level real-time audio transport facade.
- `AudioChunkQueue` bounded FIFO queue supporting `DROP_OLDEST`, `DROP_NEWEST`, and `REJECT` backpressure drop strategies.
- `AudioChunkTransport` chunk payload validation and sequence ordering / gap / duplicate detection.
- `AudioChunkSerializer` for ArrayBuffer in-memory context transfers.
- `AudioTransportRouter` routing to `SPEECH_PIPELINE`.
- `SpeechPipelineBoundary`, `SpeechPipelineAdapter`, and `NullSpeechPipelineAdapter` establishing the abstract contract for Module 4.
- `AudioTransportHealthMonitor` and `AudioTransportRecoveryManager`.
- 22 new EventBus topics (`audio.transport_initialized`, `audio.transport_started`, `audio.transport_paused`, `audio.transport_resumed`, `audio.transport_draining`, `audio.transport_stopped`, `audio.transport_chunk_received`, `audio.transport_chunk_queued`, `audio.transport_chunk_delivered`, `audio.transport_chunk_dropped`, `audio.transport_chunk_rejected`, `audio.transport_sequence_gap`, `audio.transport_duplicate_chunk`, `audio.transport_out_of_order`, `audio.transport_backpressure`, `audio.transport_health_changed`, `audio.transport_error`, `audio.transport_recovery_started`, `audio.transport_recovery_completed`, `audio.transport_recovery_failed`, `audio.speech_pipeline_ready`, `audio.speech_pipeline_error`).
- Custom errors (`AudioTransportError`, `AudioQueueFullError`, `AudioTransportValidationError`, `AudioTransportSequenceError`, `SpeechPipelineBoundaryError`, `SpeechPipelineAdapterError`, `AudioTransportRecoveryError`, `AudioTransportTimeoutError`).
- 5 new unit and integration test files across `src/test/audiochunkqueue.test.ts`, `src/test/speechpipelineboundary.test.ts`, `src/test/audiotransporthealth.test.ts`, `src/test/audiotransportrecovery.test.ts`, and `src/test/audiotransport.test.ts` (Total 97 passing tests across 56 test suites).
- Technical documentation in `docs/modules/audio-transport/`.
