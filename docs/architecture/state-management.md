# State Management Architecture

Uses an XState-inspired finite state machine running in the Background Service Worker:

States: `IDLE` -> `CAPTURING` -> `TRANSCRIBING` -> `VERIFYING` -> `PAUSED` -> `ERROR`.

State diffs are broadcast to Content Script UI subscribers via typed ports.
