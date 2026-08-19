# Provider-Agnostic Speech Recognition Pipeline - Technical Overview

## Summary
Provider-agnostic speech recognition engine consuming Module 3D audio chunks and speech segments, managing recognition sessions, routing across speech providers, aggregating streaming partial/final transcripts into FinalizedTranscript objects for Module 5.

## Components Implemented
- `SpeechRecognitionEngine`: Top-level engine orchestrating provider router, session manager, transcript aggregator, health monitor, and metrics.
- `ISpeechRecognitionProvider`: Abstract interface for speech recognition vendors.
- `NullSpeechRecognitionProvider`: Default testable/offline provider implementation.
- `SpeechProviderRegistry` & `SpeechProviderRouter`: Vendor registration and priority-based fallback routing.
- `RecognitionSessionManager`: Session lifecycle manager (`IDLE` -> `ACTIVE` -> `STOPPED`).
- `PartialTranscriptManager`: Manages transient streaming partial text.
- `TranscriptSegmentRegistry`: Immutable final transcript segment store.
- `TranscriptDeduplicationManager`: Prevents duplicate sequence outputs.
- `TranscriptTimestampNormalizer` & `TranscriptQualityManager`: Normalizes timestamps relative to session start and evaluates segment quality.
- `TranscriptAggregator`: Combines partial and final results into `FinalizedTranscript` for Module 5.
- `SpeechLanguageManager` & `ConfidenceNormalizer`: Multi-language handling and confidence score normalization.
- `SpeechRecognitionHealthMonitor` & `SpeechRecognitionRecoveryManager`: Health status monitoring and exponential backoff recovery.
