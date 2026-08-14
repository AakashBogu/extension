# Offscreen Audio Runtime - Data Flow & Lifecycle

1. Service Worker sends OFFSCREEN_INIT -> 2. Bridge dispatches typed message -> 3. DocManager creates offscreen document -> 4. AudioRuntime initializes AudioContext -> 5. Bridge responds with correlationId -> 6. Status transitions to READY.
