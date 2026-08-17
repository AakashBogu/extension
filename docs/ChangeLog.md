# System Changelog

## [3.2.0-module3c] - 2026-08-17
### Added
- `AudioProcessingEngine` top-level real-time audio processing facade.
- `AudioProcessor` composite processing orchestrator.
- `PCMExtractor` Float32 PCM extractor with NaN and Infinity sanitization.
- `ChannelMixer` supporting `MONO_AVERAGE`, `LEFT`, `RIGHT`, and `MAX_ENERGY` mono conversion.
- `AudioResampler` sample rate converter with sample continuity tracking (e.g. 48kHz -> 16kHz).
- `AudioFrameGenerator` slicing continuous PCM into 20ms frames (320 samples @ 16kHz).
- `AudioChunkManager` aggregating frames into 1s transcription chunks.
- `AudioSignalAnalyzer` calculating RMS, Peak, ZCR, and dB.
- `VoiceActivityDetector` hybrid VAD with adaptive noise floor estimation, speech persistence (3 frames), and hangover (500ms).
- `SpeechSegmentManager` tracking and finalizing speech segment intervals.
- `AudioProcessingRegistry` tracking processing metrics and dropped frames.
- 14 new EventBus topics (`audio.processing_started`, `audio.processing_stopped`, `audio.processing_paused`, `audio.processing_resumed`, `audio.pcm_frame`, `audio.chunk_ready`, `audio.signal_metrics`, `audio.vad_state_changed`, `audio.speech_started`, `audio.speech_ended`, `audio.speech_segment_ready`, `audio.processing_error`, `audio.processing_health_changed`, `audio.noise_floor_updated`).
- Custom errors (`AudioProcessingError`, `PCMExtractionError`, `ResamplingError`, `FrameGenerationError`, `AudioChunkError`, `VADProcessingError`, `SpeechSegmentError`, `AudioBackpressureError`).
- 7 new unit and adversarial test files across `src/test/pcmextractor.test.ts`, `src/test/audioresampler.test.ts`, `src/test/audioframegenerator.test.ts`, `src/test/audiosignal.test.ts`, `src/test/vad.test.ts`, `src/test/speechsegment.test.ts`, and `src/test/audioprocessing.test.ts` (Total 91 passing tests across 51 test suites).
- Technical documentation in `docs/modules/audio-processing/`.
