# Provider-Agnostic Speech Recognition Pipeline - Data Flow & Lifecycle

1. Module 3D delivers AudioChunk -> 2. SpeechRecognitionEngine forwards to active ISpeechRecognitionProvider -> 3. Provider emits RecognitionResult -> 4. Validator & ConfidenceNormalizer sanitize -> 5. TranscriptAggregator updates partial or final segments -> 6. Builds FinalizedTranscript -> 7. Emits speech.transcript_updated event for Module 5.
