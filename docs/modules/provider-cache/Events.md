# Provider Response Caching & In-Flight Request Deduplication Layer - Event Specifications

Publishes 11 EventBus topics: provider.cache_initialized, provider.cache_hit, provider.cache_miss, provider.cache_inserted, provider.cache_evicted, provider.cache_expired, provider.cache_invalidated, provider.cache_cleared, provider.cache_deduplicated, provider.cache_error, provider.cache_health_changed.
