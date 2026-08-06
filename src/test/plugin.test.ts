import { describe, it, expect, beforeEach } from 'vitest';
import { ServiceContainer } from '../core/di/ServiceContainer';
import { PluginManager } from '../core/plugin/PluginManager';
import { IExtendedPlugin } from '../core/plugin/PluginTypes';
import { InvalidPluginError } from '../core/error/DIPluginErrors';

describe('Module 1B: Plugin Framework', () => {
  let container: ServiceContainer;
  let pluginManager: PluginManager;

  beforeEach(() => {
    container = new ServiceContainer();
    pluginManager = new PluginManager(container);
  });

  it('should register and initialize a valid plugin', async () => {
    let initialized = false;
    const testPlugin: IExtendedPlugin = {
      id: 'test-plugin-1',
      name: 'Test Plugin',
      version: '1.0.0',
      async initialize(_c) {
        initialized = true;
      },
      async destroy() {}
    };

    await pluginManager.registerPlugin(testPlugin);
    expect(initialized).toBe(true);

    const meta = pluginManager.getPluginMetadata('test-plugin-1');
    expect(meta?.status).toBe('initialized');
  });

  it('should handle plugin start, stop, and destroy lifecycle', async () => {
    let state = 'created';
    const lifecyclePlugin: IExtendedPlugin = {
      id: 'lifecycle-plugin',
      name: 'Lifecycle Plugin',
      version: '1.0.0',
      async initialize() { state = 'initialized'; },
      async start() { state = 'started'; },
      async stop() { state = 'stopped'; },
      async destroy() { state = 'destroyed'; }
    };

    await pluginManager.registerPlugin(lifecyclePlugin);
    expect(state).toBe('initialized');

    await pluginManager.startPlugin('lifecycle-plugin');
    expect(state).toBe('started');

    await pluginManager.stopPlugin('lifecycle-plugin');
    expect(state).toBe('stopped');

    await pluginManager.unregisterPlugin('lifecycle-plugin');
    expect(state).toBe('destroyed');
  });

  it('should catch plugin initialization errors gracefully', async () => {
    const failingPlugin: IExtendedPlugin = {
      id: 'failing-plugin',
      name: 'Failing Plugin',
      version: '1.0.0',
      async initialize() {
        throw new Error('Plugin crash on boot');
      },
      async destroy() {}
    };

    await expect(pluginManager.registerPlugin(failingPlugin)).rejects.toThrow(InvalidPluginError);
    const meta = pluginManager.getPluginMetadata('failing-plugin');
    expect(meta?.status).toBe('error');
  });
});
