# Provider-Agnostic Speech Recognition Pipeline - Known Limitations

- Core pipeline is provider-agnostic and defaults to `NullSpeechRecognitionProvider` for offline/test environments.
- Future vendors (Whisper, Gemini Live, Cloud STT) plug directly into `ISpeechRecognitionProvider` without altering core engine contracts.
