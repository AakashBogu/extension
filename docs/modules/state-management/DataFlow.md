# State Management Architecture - Data Flow & Lifecycle

1. Action triggers setState -> 2. New frozen state created -> 3. Selectors invalidated -> 4. Subscriptions notified -> 5. StateChanged event published.
