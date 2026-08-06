# Plugin Architecture Framework - Public API Specifications

```typescript
export class PluginManager {
  registerPlugin(plugin: IExtendedPlugin): Promise<void>;
  startPlugin(pluginId: string): Promise<void>;
  stopPlugin(pluginId: string): Promise<void>;
  unregisterPlugin(pluginId: string): Promise<void>;
  listPlugins(): PluginMetadata[];
}
```
