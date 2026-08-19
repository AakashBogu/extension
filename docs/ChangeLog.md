# System Changelog

## [6.3.0-module6c] - 2026-08-19
### Added
- `OpenAIProvider` concrete AI provider adapter (`ai.openai`).
- `GeminiProvider` concrete AI provider adapter (`ai.gemini`).
- `BraveSearchProvider` concrete Search provider adapter (`search.brave`).
- `BingSearchProvider` concrete Search provider adapter (`search.bing`).
- `HttpClient` timeout-aware fetch wrapper with error normalization.
- `ProviderCredentialManager` resolving credentials securely via `SecretsManager`.
- `ProviderConfigurationValidator` validating adapter settings.
- `ProviderBootstrap` factory initializing enabled providers into registries.
- 8 new unit test files across `src/test/openai.test.ts`, `src/test/gemini.test.ts`, `src/test/brave.test.ts`, `src/test/bing.test.ts`, `src/test/providerconfiguration.test.ts`, `src/test/providercredentials.test.ts`, `src/test/providerbootstrap.test.ts`, and `src/test/provideradaptererrors.test.ts` (Total 156 passing tests across 104 test suites).
- Technical documentation in `docs/modules/provider-adapters/`.
