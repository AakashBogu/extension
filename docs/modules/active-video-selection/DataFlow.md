# Active Video Selection Engine - Data Flow & Lifecycle

1. Video factors update -> 2. ScoringEngine calculates scores -> 3. Selector picks best candidate -> 4. Updates activeVideoId -> 5. Emits active_video.changed to EventBus.
