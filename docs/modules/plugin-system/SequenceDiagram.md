# Plugin Architecture Framework - Sequence Diagram

```mermaid
sequenceDiagram
  App->>PluginManager: registerPlugin(plugin)
  PluginManager->>Plugin: initialize(container)
  PluginManager->>PluginManager: Set status to "initialized"
```
