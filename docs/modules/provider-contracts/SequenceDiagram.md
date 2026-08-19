# AI & Search Provider Abstraction Layer — Provider Contracts - Sequence Diagram

```mermaid
sequenceDiagram
  RequestManager->>ISearchProvider: search(request)
  ISearchProvider-->>RequestManager: SearchResponse
  RequestManager->>IAIProvider: analyze(request)
  IAIProvider-->>RequestManager: AIResponse
```
