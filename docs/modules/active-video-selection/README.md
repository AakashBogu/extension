# Active Video Selection Engine - Technical Overview

## Summary
Continuous primary video analysis candidate selection based on weighted multi-factor scoring, IntersectionObserver viewport visibility tracking, focus tracking, user interaction, and manual/pinned video overrides.

## Components Implemented
- `ActiveVideoManager`: Top-level active video selection manager.
- `ActiveVideoSelector`: Selects highest scoring video candidate and manages pinned video overrides.
- `VideoScoringEngine`: Weighted multi-factor scoring algorithm evaluating playing state, viewport visibility %, size, fullscreen, PIP, unmuted state, focus state, and recent user interaction.
- `VisibilityTracker` & `ViewportObserver`: Tracks element visibility ratio via `IntersectionObserver`.
- `FocusTracker`: Tracks element focus.
- `InteractionTracker`: Records mouse click/hover/keyboard interaction timestamps.
