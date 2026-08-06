# Video Lifecycle Manager - Known Limitations

- Invalid transitions (e.g. `PAUSED` directly to `STALLED`) are rejected safely by the state machine to prevent state corruption.
