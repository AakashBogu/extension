# Dependency Injection Container - Developer Guide

```typescript
import { ServiceContainer } from '@core/di/ServiceContainer';
import { PluginManager } from '@core/plugin/PluginManager';

const container = new ServiceContainer();
container.bind('MY_SERVICE').toValue(myService);

const pluginManager = new PluginManager(container);
await pluginManager.registerPlugin(myPlugin);
```
