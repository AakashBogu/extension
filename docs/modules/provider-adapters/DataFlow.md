# Concrete Provider Adapter Layer - Data Flow & Lifecycle

1. Router calls adapter analyze/search -> 2. Adapter resolves credential securely via ProviderCredentialManager -> 3. Formats vendor request payload -> 4. HttpClient executes HTTP fetch with AbortController timeout -> 5. Adapter parses response and normalizes output into AIResponse / SearchResponse.
