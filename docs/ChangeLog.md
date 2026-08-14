# System Changelog

## [3.1.0-module3b] - 2026-08-14
### Added
- `TabAudioCaptureManager` top-level tab audio capture facade.
- `TabCaptureSessionManager` managing session lifecycle (`IDLE`, `REQUESTING`, `STARTING`, `ACTIVE`, `PAUSED`, `STOPPING`, `STOPPED`, `ERROR`, `RECOVERING`, `DESTROYED`).
- `TabCaptureStreamManager` for `MediaStream` audio track discovery, track monitoring (`readyState === "live"`), and ended track handling.
- `TabCapturePermissionManager` and `TabCaptureCapabilityManager`.
- `TabCaptureHealthMonitor` and `TabCaptureRecoveryManager` for exponential backoff stream recovery.
- `TabAudioCaptureController` subscribing to `tab.removed` and `active_video.changed` events.
- `TabAudioCaptureHarness` developer diagnostic harness.
- 16 new EventBus topics (`audio.capture_requested`, `audio.capture_starting`, `audio.capture_started`, `audio.capture_active`, `audio.capture_paused`, `audio.capture_resumed`, `audio.capture_stopping`, `audio.capture_stopped`, `audio.capture_track_ended`, `audio.capture_error`, `audio.capture_health_changed`, `audio.capture_recovery_started`, `audio.capture_recovery_completed`, `audio.capture_recovery_failed`, `audio.capture_tab_invalid`, `audio.capture_capability_changed`).
- Custom errors (`TabAudioCaptureError`, `TabCapturePermissionError`, `TabCaptureCapabilityError`, `TabCaptureSessionError`, `TabCaptureStreamError`, `TabCaptureValidationError`, `TabCaptureRecoveryError`, `TabCaptureTimeoutError`).
- 4 new unit test files across `src/test/tabaudiocapture.test.ts`, `src/test/tabcapturesession.test.ts`, `src/test/tabcapturestream.test.ts`, and `src/test/tabcapturerecovery.test.ts` (Total 83 passing tests across 44 test suites).
- Technical documentation in `docs/modules/tab-audio-capture/`.
