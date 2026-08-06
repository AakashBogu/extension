# Video Lifecycle Manager - Data Flow & Lifecycle

1. Video media event fires -> 2. VLO captures event -> 3. VSR resolves state -> 4. VSM validates transition -> 5. VLR updates registry history -> 6. Emits video.state_changed to EventBus.
