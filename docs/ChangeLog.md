# System Changelog

## [6.1.0-module6a] - 2026-08-19
### Added
- `ISearchProvider` provider-neutral search interface.
- `SearchRequest`, `SearchResponse`, `SearchResult`, `SearchProviderCapabilities`, `SearchProviderHealth`, and `SearchProviderConfiguration` contracts.
- `IAIProvider` provider-neutral AI interface.
- `AIRequest`, `AIResponse`, `AIProviderCapabilities`, `AIProviderHealth`, and `AIProviderConfiguration` contracts with `AIOperationType` (`QUERY_GENERATION`, `CLAIM_ANALYSIS`, `SOURCE_ANALYSIS`, `EVIDENCE_SUMMARY`).
- `ProviderTypes` shared provider metadata, type, status, priority, and health contracts.
- `ProviderErrors` error hierarchy (`ProviderError`, `ProviderInitializationError`, `ProviderConfigurationError`, `ProviderCapabilityError`, `ProviderRequestError`, `ProviderResponseError`).
- Unit test suite `src/test/providercontracts.test.ts` (Total 132 passing tests across 89 test suites).
- Technical documentation in `docs/modules/provider-contracts/`.
