# AI & Search Provider Registries & Routing Layer - Data Flow & Lifecycle

1. Request Manager dispatches request -> 2. Router inspects required capabilities/operations -> 3. Selects highest priority healthy provider -> 4. Executes request -> 5. If provider fails, records failure in HealthManager & routes to fallback provider.
