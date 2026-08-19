# Provider Response Caching & In-Flight Request Deduplication Layer - Known Limitations

- Cache storage is strictly in-memory; cache entries are lost when extension service worker terminates or reloads.
