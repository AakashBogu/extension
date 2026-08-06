# System Changelog

## [2.4.0-module2e] - 2026-08-06
### Added
- `ActiveVideoManager` top-level active video selection manager.
- `VideoScoringEngine` calculating weighted scores based on playing state, visibility %, size, fullscreen, PIP, unmuted state, focus, and user interaction.
- `ActiveVideoSelector` selecting highest scoring video candidate and managing pinned video overrides.
- `ViewportObserver` and `VisibilityTracker` tracking element visibility ratios using `IntersectionObserver`.
- `FocusTracker` and `InteractionTracker`.
- 6 new EventBus topics (`active_video.changed`, `active_video.selected`, `active_video.lost`, `video.score_updated`, `video.candidate_added`, `video.candidate_removed`).
- Custom errors (`ActiveVideoError`, `VideoSelectionError`, `ScoringError`, `VisibilityTrackingError`).
- 3 new unit test files across `src/test/videoscoring.test.ts`, `src/test/viewportobserver.test.ts`, and `src/test/activevideomanager.test.ts` (Total 69 passing tests across 32 test suites).
- Technical documentation in `docs/modules/active-video-selection/`.
