# System Changelog

## [2.5.0-module2f] - 2026-08-06
### Added
- `BrowserIntegrationManager` top-level browser integration facade.
- `BrowserPipeline` orchestrating end-to-end browser runtime and video discovery, lifecycle, playback, and selection pipeline.
- `BrowserHealthMonitor` running diagnostic health checks over the full pipeline.
- `BrowserCleanupManager` purging detached videos, unused observers, and orphaned snapshots.
- `BrowserCompatibilityManager` checking browser feature support (ShadowDOM, IntersectionObserver, Offscreen, Chrome APIs).
- `BrowserPerformanceManager` tracking discovery/selection latency and memory usage.
- `BrowserValidationManager` enforcing pipeline invariants (active video uniqueness, registry consistency).
- `DeveloperValidationHarness` providing site validation diagnostics (YouTube, Vimeo, Facebook, X, Generic).
- 8 new EventBus topics (`browser_pipeline.ready`, `browser_pipeline.error`, `video_pipeline.ready`, `video_pipeline.error`, `health_check.completed`, `resource_cleanup.completed`, `compatibility_check.completed`, `performance_report.ready`).
- Custom errors (`BrowserIntegrationError`, `PipelineValidationError`, `CompatibilityError`, `CleanupError`, `HealthCheckError`).
- 4 new integration test files across `src/test/browserpipeline.test.ts`, `src/test/browserhealth.test.ts`, `src/test/browsercleanup.test.ts`, and `src/test/browserintegration.test.ts` (Total 73 passing tests across 36 test suites).
- Technical documentation in `docs/modules/browser-integration/`.
