# Browser Runtime & Context Manager - Technical Overview

## Summary
Browser environment, active tab, window, navigation (normal & SPA history), page lifecycle, and permissions abstraction.

## Components Implemented
- BrowserRuntime: Top-level runtime entrypoint.
- RuntimeManager: Coordinator for managers and context.
- BrowserContext: Encapsulates active tab, window, URL, origin, domain, permissions, and lifecycle.
- TabManager: Active tab detection, tab creation, activation, updates, and removal.
- WindowManager: Window creation, closing, and focus state tracking.
- NavigationManager: Normal & SPA history navigation (pushState, replaceState, popstate), URL changes, and DOM page lifecycle.
