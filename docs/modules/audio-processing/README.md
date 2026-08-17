# Real-Time Audio Processing & Voice Activity Detection Engine - Technical Overview

## Summary
In-memory Float32 PCM extraction, channel mixing to mono, linear interpolation sample rate normalization to 16kHz, 20ms frame slicing, 1s chunk aggregation, signal metrics (RMS, Peak, ZCR, dB), adaptive noise floor estimation, VAD state machine (SILENCE, POSSIBLE_SPEECH, SPEECH, POSSIBLE_SILENCE), speech hangover detection, and bounded queue backpressure.

## Components Implemented
- `AudioProcessingEngine`: Top-level facade coordinating audio processing lifecycle.
- `AudioProcessor`: Composite processor orchestrating PCM extraction, channel mixing, resampling, frame generation, chunk management, signal analysis, VAD, and speech segmentation.
- `PCMExtractor`: Float32 PCM extractor with NaN and Infinity sanitization.
- `ChannelMixer`: Multi-channel to mono mixer (`MONO_AVERAGE`, `LEFT`, `RIGHT`, `MAX_ENERGY`).
- `AudioResampler`: Sample rate converter (e.g. 48kHz -> 16kHz) with sample continuity tracking.
- `AudioFrameGenerator`: Fixed-duration frame generator (20ms @ 16kHz = 320 samples).
- `AudioChunkManager`: Aggregates frames into 1s transcription chunks.
- `AudioSignalAnalyzer`: Calculates RMS, Peak, ZCR, dB.
- `VoiceActivityDetector`: Hybrid VAD with adaptive noise floor estimation, speech persistence (3 frames), and hangover (500ms).
- `SpeechSegmentManager`: Speech segment tracking and finalization.
- `AudioProcessingRegistry`: Telemetry metrics registry.
