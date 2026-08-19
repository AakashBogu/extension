# AI & Search Provider Abstraction Layer — Provider Contracts - Data Flow & Lifecycle

1. Request Manager creates SearchRequest / AIRequest -> 2. Dispatches to ISearchProvider / IAIProvider -> 3. Provider returns vendor-neutral SearchResponse / AIResponse -> 4. Forwards to verification engine.
