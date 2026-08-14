# System Changelog

## [3.0.0-module3a] - 2026-08-14
### Added
- `OffscreenDocumentManager` managing Manifest V3 `chrome.offscreen.createDocument` and `closeDocument` lifecycle.
- `AudioContextRuntime` encapsulating `AudioContext` states (`suspended`, `running`, `closed`).
- `OffscreenAudioRuntime` unified facade (`initialize`, `start`, `stop`, `suspend`, `resume`, `destroy`, `getStatus`, `healthCheck`).
- `OffscreenBridge` implementing `IOffscreenBridge` with correlation ID request/response tracking.
- `OffscreenMessageRouter` for message validation and routing.
- `OffscreenCapabilityManager` for Web Audio, AudioWorklet, and Extension API capability detection.
- `OffscreenHealthMonitor` and periodic heartbeat.
- `OffscreenRecoveryManager` with exponential backoff and maximum retry limits.
- 15 new EventBus topics (`offscreen.creating`, `offscreen.created`, `offscreen.initializing`, `offscreen.ready`, `offscreen.started`, `offscreen.stopped`, `offscreen.suspended`, `offscreen.resumed`, `offscreen.destroyed`, `offscreen.error`, `offscreen.health_changed`, `offscreen.heartbeat`, `offscreen.recovery_started`, `offscreen.recovery_completed`, `offscreen.recovery_failed`).
- Custom errors (`OffscreenRuntimeError`, `OffscreenCreationError`, `OffscreenInitializationError`, `OffscreenMessageError`, `OffscreenCapabilityError`, `OffscreenRecoveryError`, `AudioContextRuntimeError`).
- 4 new unit test files across `src/test/offscreendocument.test.ts`, `src/test/offscreenmessaging.test.ts`, `src/test/offscreenhealth.test.ts`, and `src/test/offscreenrecovery.test.ts` (Total 78 passing tests across 40 test suites).
- Technical documentation in `docs/modules/offscreen-audio-runtime/`.
