# Playback Tracking Engine - Technical Overview

## Summary
Continuous HTML5 video playback telemetry, snapshot generation, delta calculations, watch time accumulation, seek/pause statistics, and PIP/fullscreen tracking.

## Components Implemented
- `PlaybackTrackingEngine`: Top-level playback tracking orchestrator.
- `PlaybackTracker`: Attaches 16 HTML5 playback DOM event listeners (`timeupdate`, `ratechange`, `volumechange`, `durationchange`, `progress`, `seeking`, `seeked`, `waiting`, `playing`, `pause`, `ended`, `stalled`, `resize`, `enterpictureinpicture`, `leavepictureinpicture`, `fullscreenchange`).
- `PlaybackRegistry`: Stores latest state, previous state, snapshots history, and session metrics per video.
- `PlaybackSnapshotManager`: Creates `PlaybackSnapshot` instances computing time deltas, current time deltas, progress %, and session durations.
- `PlaybackMetricsCollector`: Computes watch time, pause count, seek count, average playback rate, buffer count, buffer duration, fullscreen time, PIP time, and volume changes.
- `PlaybackStateResolver`: Resolves current `PlaybackState` from HTMLVideoElement properties.
