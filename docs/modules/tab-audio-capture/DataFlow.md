# Real-Time Tab Audio Capture Engine - Data Flow & Lifecycle

1. TabAudioCaptureManager.startCapture(tabId) -> 2. Capability & Permission check -> 3. TabCaptureStreamManager acquires & validates MediaStream -> 4. Registers session ACTIVE -> 5. Emits audio.capture_started to EventBus.
