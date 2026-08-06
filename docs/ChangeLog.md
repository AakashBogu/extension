# System Changelog

## [2.3.0-module2d] - 2026-08-06
### Added
- `PlaybackTrackingEngine` top-level playback telemetry tracking engine.
- `PlaybackTracker` capturing 16 DOM playback events (`timeupdate`, `ratechange`, `volumechange`, `durationchange`, `progress`, `seeking`, `seeked`, `waiting`, `playing`, `pause`, `ended`, `stalled`, `resize`, `enterpictureinpicture`, `leavepictureinpicture`, `fullscreenchange`).
- `PlaybackSnapshotManager` computing time deltas, progress percentages, session duration, and snapshot ring history.
- `PlaybackMetricsCollector` aggregating watch time, pause count, seek count, buffer count, fullscreen time, and PIP time.
- `PlaybackStateResolver` extracting current `PlaybackState` from HTMLVideoElement properties.
- `PlaybackRegistry` managing playback session records.
- 13 new EventBus topics (`playback.started`, `playback.updated`, `playback.paused`, `playback.seek_started`, `playback.seek_completed`, `playback.rate_changed`, `playback.volume_changed`, `playback.progress`, `playback.buffering`, `playback.resumed`, `playback.ended`, `playback.fullscreen_changed`, `playback.pip_changed`).
- Custom errors (`PlaybackTrackingError`, `PlaybackSnapshotError`, `PlaybackMetricsError`).
- 3 new unit test files across `src/test/playbacktracker.test.ts`, `src/test/playbacksnapshot.test.ts`, and `src/test/playbackmetrics.test.ts` (Total 65 passing tests across 29 test suites).
- Technical documentation in `docs/modules/playback-tracking/`.
