# AI & Search Provider Abstraction Layer — Provider Contracts - Technical Overview

## Summary
Vendor-neutral provider contracts for Search (ISearchProvider, SearchRequest, SearchResponse, SearchResult) and AI (IAIProvider, AIRequest, AIResponse, AIOperationType), along with shared provider metadata and a custom provider error hierarchy.

## Components Implemented
- `ProviderTypes`: Shared provider metadata, type, status, priority, and health definitions.
- `ISearchProvider` & `SearchProviderTypes`: Provider-neutral search interface, search capability flags, and request/response contracts.
- `IAIProvider` & `AIProviderTypes`: Provider-neutral AI interface, supported operations (`QUERY_GENERATION`, `CLAIM_ANALYSIS`, `SOURCE_ANALYSIS`, `EVIDENCE_SUMMARY`), and request/response contracts.
- `ProviderErrors`: Error hierarchy (`ProviderError`, `ProviderInitializationError`, `ProviderConfigurationError`, `ProviderCapabilityError`, `ProviderRequestError`, `ProviderResponseError`) with retryable flags.
