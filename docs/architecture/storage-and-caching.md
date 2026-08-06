# Storage & Caching Strategy

- **L1 Cache**: In-Memory LRU Map (50 entries, 5 min TTL).
- **L2 Cache**: IndexedDB via `idb` (10,000 verdict entries, 24 hr TTL).
- **Chrome Storage**: User preferences & active model keys.
