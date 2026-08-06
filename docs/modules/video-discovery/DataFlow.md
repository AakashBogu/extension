# Video Discovery Engine - Data Flow & Lifecycle

1. Scanner or Observer finds HTMLVideoElement -> 2. Extractor builds DiscoveredVideoMetadata -> 3. Registry stores metadata -> 4. Emits video.registered to EventBus.
