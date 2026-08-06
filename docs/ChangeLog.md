# System Changelog

## [2.0.0-module2a] - 2026-08-06
### Added
- BrowserRuntime and RuntimeManager top-level browser runtime engine.
- TabManager for tab creation, activation, removal, and listing.
- WindowManager for window creation, focus, and state management.
- NavigationManager for normal & SPA navigation (pushState, replaceState, popstate), URL changes, and DOM page lifecycle events (DOMContentLoaded, visibilitychange, focus, blur).
- BrowserContext exposing current tab, window, origin, domain, permissions status, and page lifecycle state.
- 13 new EventBus topics (tab.*, window.*, navigation.*, url.changed, page.*).
- Custom errors (BrowserRuntimeError, NavigationError, ContextError, TabError, WindowError).
- 5 new unit test files (Total 52 passing tests across 20 test suites).
- Technical documentation in docs/modules/browser-runtime/.
