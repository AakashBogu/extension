# Browser Runtime & Context Manager - Data Flow & Lifecycle

1. Browser event occurs (tab/window/nav) -> 2. Processed by Manager -> 3. Updates internal state -> 4. Emits EventBus event -> 5. Exposed via BrowserContext.
