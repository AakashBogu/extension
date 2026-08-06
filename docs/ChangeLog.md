# System Changelog

## [2.2.0-module2c] - 2026-08-06
### Added
- `VideoLifecycleManager` top-level video lifecycle manager.
- `VideoStateMachine` validating 14 lifecycle states (`UNKNOWN`, `DISCOVERED`, `METADATA_LOADING`, `METADATA_READY`, `READY`, `CAN_PLAY`, `PLAYING`, `PAUSED`, `BUFFERING`, `SEEKING`, `WAITING`, `STALLED`, `ENDED`, `DESTROYED`).
- `VideoStateResolver` resolving 20 HTML5 video media events into lifecycle states.
- `VideoLifecycleRegistry` managing transition history and timestamps per video.
- `VideoLifecycleObserver` for auto-attachment and detachment of HTML5 media event listeners.
- 10 new EventBus topics (`video.state_changed`, `video.ready`, `video.playing`, `video.paused`, `video.buffering`, `video.waiting`, `video.stalled`, `video.ended`, `video.destroyed`, `video.error`).
- Custom errors (`VideoLifecycleError`, `LifecycleTransitionError`, `ListenerError`).
- 5 new unit test cases across `src/test/videostatemachine.test.ts`, `src/test/videostateresolver.test.ts`, and `src/test/videolifecycle.test.ts` (Total 62 passing tests across 26 test suites).
- Technical documentation in `docs/modules/video-lifecycle/`.
