# System Changelog

## [6.5.0-module6e] - 2026-08-19
### Added
- `ProviderResponseCache` in-memory caching storage with TTL expiration.
- `ProviderCacheKeyGenerator` generating deterministic request fingerprints.
- `ProviderCachePolicy` managing TTLs, entry bounds, and memory limits.
- `ProviderCacheEvictionManager` implementing LRU eviction based on access sequence.
- `ProviderInFlightDeduplicator` coalescing concurrent in-flight requests into single promises.
- `ProviderCacheMetricsCollector` tracking hits, misses, evictions, deduplications, and hit rates.
- `ProviderCacheHealthMonitor` monitoring memory pressure and cache status.
- `ProviderCacheInvalidationManager` managing targeted cache invalidation.
- 11 new EventBus topics (`provider.cache_initialized`, `provider.cache_hit`, `provider.cache_miss`, `provider.cache_inserted`, `provider.cache_evicted`, `provider.cache_expired`, `provider.cache_invalidated`, `provider.cache_cleared`, `provider.cache_deduplicated`, `provider.cache_error`, `provider.cache_health_changed`).
- Custom errors (`ProviderCacheError`, `ProviderCacheKeyError`, `ProviderCacheCapacityError`, `ProviderCacheSerializationError`, `ProviderCacheInvalidationError`, `ProviderCacheInternalError`).
- 7 new unit test files across `src/test/providerresponsecache.test.ts`, `src/test/providercachekey.test.ts`, `src/test/providercacheeviction.test.ts`, `src/test/providerinflightdeduplication.test.ts`, `src/test/providercachemetrics.test.ts`, `src/test/providercachehealth.test.ts`, and `src/test/providercacheexecutionintegration.test.ts` (Total 174 passing tests across 121 test suites).
- Technical documentation in `docs/modules/provider-cache/`.
