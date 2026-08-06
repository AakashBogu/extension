# Video Lifecycle Manager - Technical Overview

## Summary
HTML5 video lifecycle state machine, DOM media event observer (20 events), event resolution to validated state transitions, and history tracking.

## Components Implemented
- `VideoLifecycleManager`: Top-level lifecycle entrypoint.
- `VideoStateMachine`: State machine enforcing validated transitions across 14 lifecycle states (`UNKNOWN`, `DISCOVERED`, `METADATA_LOADING`, `METADATA_READY`, `READY`, `CAN_PLAY`, `PLAYING`, `PAUSED`, `BUFFERING`, `SEEKING`, `WAITING`, `STALLED`, `ENDED`, `DESTROYED`).
- `VideoStateResolver`: Maps 20 HTML5 video DOM media events into target lifecycle states.
- `VideoLifecycleRegistry`: Maintains state, previous state, transition history, and event timestamps.
- `VideoLifecycleObserver`: Attaches and detaches HTML5 media event listeners automatically when videos are registered or removed.
