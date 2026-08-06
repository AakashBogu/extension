# System Component Diagram

Describes the topology and component interrelationships across the extension lifecycle.

```mermaid
componentDiagram
    package "Content Script" {
        [VideoDetector]
        [PlaybackSyncController]
        [OverlayUIRenderer]
    }
    package "Background Service Worker" {
        [DI Container]
        [EventBus]
        [CoreOrchestrator]
        [CostManager]
        [MetricsCollector]
        [AIProviderRegistry]
        [SearchProviderRegistry]
    }
    package "Offscreen Document" {
        [AudioCapturer]
        [VADEngine]
        [TranscriptionEngine]
        [OCREngine]
    }
    [VideoDetector] --> [CoreOrchestrator]
    [AudioCapturer] --> [VADEngine]
    [VADEngine] --> [TranscriptionEngine]
    [TranscriptionEngine] --> [EventBus]
    [EventBus] --> [OverlayUIRenderer]
```
