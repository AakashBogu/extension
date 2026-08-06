# Playback Tracking Engine - Data Flow & Lifecycle

1. HTMLVideoElement fires playback event -> 2. Tracker captures event -> 3. Resolver extracts PlaybackState -> 4. SnapshotManager computes snapshot delta -> 5. MetricsCollector updates session stats -> 6. Registry stores record -> 7. Emits playback.* event to EventBus.
