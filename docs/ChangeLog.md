# System Changelog

## [4.0.0-module4] - 2026-08-19
### Added
- `SpeechRecognitionEngine` top-level provider-agnostic speech recognition facade.
- `ISpeechRecognitionProvider` interface and `NullSpeechRecognitionProvider` implementation.
- `SpeechProviderRegistry` and `SpeechProviderRouter` for vendor selection and priority-based fallback.
- `RecognitionSessionManager` managing recognition session lifecycles.
- `PartialTranscriptManager` managing streaming partial text updates.
- `TranscriptSegmentRegistry` storing immutable final transcript segments.
- `TranscriptDeduplicationManager` eliminating duplicate provider outputs.
- `TranscriptTimestampNormalizer` and `TranscriptQualityManager` evaluating quality and relative timestamps.
- `TranscriptAggregator` building `FinalizedTranscript` objects for Module 5 boundary.
- `SpeechLanguageManager` supporting multi-language selection (`en-US`, `en-GB`, `ur-PK`, `hi-IN`, `sd-PK`).
- `ConfidenceNormalizer` normalizing provider confidence scores (0.0 - 1.0).
- `SpeechRecognitionHealthMonitor` and `SpeechRecognitionRecoveryManager` with exponential backoff recovery.
- 25 new EventBus topics (`speech.recognition_initialized`, `speech.recognition_started`, `speech.recognition_ready`, `speech.recognition_paused`, `speech.recognition_resumed`, `speech.recognition_stopped`, `speech.recognition_error`, `speech.recognition_recovery_started`, `speech.recognition_recovery_completed`, `speech.recognition_recovery_failed`, `speech.provider_registered`, `speech.provider_unregistered`, `speech.provider_selected`, `speech.provider_failed`, `speech.provider_switched`, `speech.partial_result`, `speech.final_result`, `speech.transcript_updated`, `speech.segment_created`, `speech.segment_finalized`, `speech.transcript_quality_changed`, `speech.health_changed`, `speech.backpressure`, `speech.result_dropped`, `speech.sequence_gap`).
- Custom errors (`SpeechRecognitionError`, `SpeechProviderError`, `SpeechProviderNotFoundError`, `RecognitionSessionError`, `TranscriptAggregationError`, `TranscriptValidationError`, `SpeechRecognitionRecoveryError`, `SpeechRecognitionTimeoutError`).
- 14 new unit test files across `src/test/speechrecognition.test.ts`, `src/test/speechproviderregistry.test.ts`, `src/test/speechproviderrouter.test.ts`, `src/test/recognitionsession.test.ts`, `src/test/partialtranscript.test.ts`, `src/test/transcriptaggregator.test.ts`, `src/test/transcriptregistry.test.ts`, `src/test/transcriptdeduplication.test.ts`, `src/test/transcripttimestamp.test.ts`, `src/test/transcriptquality.test.ts`, `src/test/speechlanguage.test.ts`, `src/test/confidence.test.ts`, `src/test/speechrecovery.test.ts`, and `src/test/speechhealth.test.ts` (Total 111 passing tests across 70 test suites).
- Technical documentation in `docs/modules/speech-recognition/`.
