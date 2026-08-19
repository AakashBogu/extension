# Provider Execution & Request Orchestration Engine - Known Limitations

- Request queueing is bounded by `maxConcurrentRequests` policy; excess requests beyond capacity raise `ProviderConcurrencyError`.
