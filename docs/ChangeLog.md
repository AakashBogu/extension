# System Changelog

## [2.1.0-module2b] - 2026-08-06
### Added
- `VideoDiscoveryEngine` top-level video discovery engine.
- `VideoRegistry` managing video IDs, WeakMap element tracking, max capacity limits, and active video selection.
- `VideoLocator` traversing root DOM and open Shadow DOM roots.
- `VideoScanner` batch discovery scanner.
- `VideoObserver` debounced `MutationObserver` watching video insertion and removal.
- `VideoMetadataExtractor` extracting static video properties (`src`, `poster`, `dimensions`, `readyState`, `preload`, `autoplay`, `muted`).
- 6 new EventBus topics (`video.discovered`, `video.registered`, `video.removed`, `video.registry_updated`, `video.scan_completed`, `video.metadata_updated`).
- Custom errors (`VideoDiscoveryError`, `RegistryError`, `MetadataError`, `DiscoveryTimeoutError`).
- 5 new unit test cases (Total 57 passing tests across 23 test suites).
- Technical documentation in `docs/modules/video-discovery/`.
