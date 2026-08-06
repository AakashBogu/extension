# System Changelog

## [1.3.0-module1d] - 2026-08-06
### Added
- `ApplicationKernel` bootstrapping and startup/shutdown orchestrator.
- `ApplicationContext` unified runtime container.
- `GlobalStateStore` with immutable state management, versioning, selector memoization (`select`), and selector subscriptions (`subscribeSelector`).
- State snapshot management (`createSnapshot`, `restoreSnapshot`, `compareSnapshots`).
- `StateRegistry` for dynamic slice metadata.
- `StatePersistenceManager` and `MemoryStatePersistenceAdapter` for hydration/persistence.
- `StateSyncManager` for cross-context state diff broadcasting.
- Custom errors (`StateValidationError`, `SnapshotError`, `PersistenceError`, `HydrationError`, `SynchronizationError`).
- 6 new unit tests across `src/test/kernel.test.ts` and `src/test/state.test.ts` (Total 32 passing tests).
- Technical documentation in `docs/modules/application-kernel/` and `docs/modules/state-management/`.
