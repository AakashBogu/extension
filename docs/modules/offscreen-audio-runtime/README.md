# Offscreen Audio Runtime - Technical Overview

## Summary
Isolated Manifest V3 offscreen document lifecycle, AudioContext runtime state management, type-safe messaging bridge, capability detection, health heartbeat, and recovery manager with exponential backoff.

## Components Implemented
- `OffscreenDocumentManager`: MV3 `chrome.offscreen` document creation & destruction lifecycle manager (`UNAVAILABLE` -> `CREATING` -> `CREATED` -> `INITIALIZING` -> `READY` -> `STOPPING` -> `DESTROYED`). Prevents duplicate creation.
- `AudioContextRuntime`: AudioContext state wrapper (`suspended`, `running`, `closed`).
- `OffscreenAudioRuntime`: Unified facade (`initialize`, `start`, `stop`, `suspend`, `resume`, `destroy`, `getStatus`, `healthCheck`).
- `OffscreenBridge` & `IOffscreenBridge`: Type-safe Chrome messaging bridge with correlation ID request/response matching.
- `OffscreenMessageRouter`: Validates and routes typed messages.
- `OffscreenCapabilityManager`: Detects Offscreen API, AudioContext, Web Audio, AudioWorklet, and extension permissions.
- `OffscreenHealthMonitor` & Heartbeat: Monitored health status & periodic heartbeat.
- `OffscreenRecoveryManager`: Auto-recreates offscreen document & audio context on crash with exponential backoff & max retry limits.
