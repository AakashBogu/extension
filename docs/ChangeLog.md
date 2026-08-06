# System Changelog

## [1.1.0-module1b] - 2026-08-06
### Added
- Complete Dependency Injection container (`ServiceContainer`), lifecycle bindings, child scoping, DFS circular dependency detector (`DependencyGraph`).
- Plugin architecture framework (`PluginManager`) with error isolation and lifecycle hooks.
- Provider registries (`AIProviderRegistry`, `SearchProviderRegistry`, `SpeechProviderRegistry`, `OCRProviderRegistry`, `StorageProviderRegistry`).
- Custom errors (`ServiceNotFoundError`, `DuplicateServiceError`, `CircularDependencyError`, `InvalidPluginError`, `InvalidProviderError`).
- Comprehensive unit test suites in `src/test/di.test.ts`, `src/test/plugin.test.ts`, `src/test/registry.test.ts` (16 passing tests).
- Technical documentation in `docs/modules/di-container/`, `docs/modules/plugin-system/`, and `docs/modules/provider-registries/`.
