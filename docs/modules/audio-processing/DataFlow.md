# Real-Time Audio Processing & Voice Activity Detection Engine - Data Flow & Lifecycle

1. TabAudioCapture feeds channel buffers -> 2. PCMExtractor sanitizes -> 3. ChannelMixer converts to Mono -> 4. AudioResampler resamples to 16kHz -> 5. AudioFrameGenerator creates 20ms frames -> 6. SignalAnalyzer computes dB & RMS -> 7. VoiceActivityDetector updates state & Noise Floor -> 8. SpeechSegmentManager emits speech segments -> 9. AudioChunkManager forms 1s chunks.
