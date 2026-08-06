import { ApplicationContext } from '../kernel/ApplicationContext';

export class RuntimeInspector {
  inspectContext(context: ApplicationContext) {
    return {
      instanceId: context.runtimeMetadata.instanceId,
      version: context.runtimeMetadata.version,
      environment: context.runtimeMetadata.env,
      uptimeMs: Date.now() - context.runtimeMetadata.startTime,
      appStatus: context.stateManager.getState().status,
      registeredPlugins: context.pluginManager.listPlugins().length
    };
  }
}
