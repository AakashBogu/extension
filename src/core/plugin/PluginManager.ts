import { IServiceContainer } from '../di/IServiceContainer';
import { IExtendedPlugin, PluginMetadata, PluginStatus } from './PluginTypes';
import { InvalidPluginError } from '../error/DIPluginErrors';

export class PluginManager {
  private plugins = new Map<string, { plugin: IExtendedPlugin; status: PluginStatus; enabled: boolean; error?: string }>();
  private container: IServiceContainer;

  constructor(container: IServiceContainer) {
    this.container = container;
  }

  async registerPlugin(plugin: IExtendedPlugin): Promise<void> {
    if (!plugin || !plugin.id || !plugin.name || !plugin.version) {
      throw new InvalidPluginError(plugin?.id || 'unknown', 'Plugin metadata missing id, name, or version');
    }

    if (this.plugins.has(plugin.id)) {
      throw new InvalidPluginError(plugin.id, 'Plugin already registered');
    }

    this.plugins.set(plugin.id, { plugin, status: 'uninitialized', enabled: true });

    try {
      await plugin.initialize(this.container);
      const entry = this.plugins.get(plugin.id)!;
      entry.status = 'initialized';
    } catch (err) {
      const entry = this.plugins.get(plugin.id)!;
      entry.status = 'error';
      entry.error = err instanceof Error ? err.message : String(err);
      throw new InvalidPluginError(plugin.id, `Initialization failed: ${entry.error}`);
    }
  }

  async startPlugin(pluginId: string): Promise<void> {
    const entry = this.plugins.get(pluginId);
    if (!entry) throw new InvalidPluginError(pluginId, 'Plugin not found');

    if (!entry.enabled) return;

    if (entry.plugin.start && entry.status === 'initialized') {
      try {
        await entry.plugin.start();
        entry.status = 'started';
      } catch (err) {
        entry.status = 'error';
        entry.error = err instanceof Error ? err.message : String(err);
        throw err;
      }
    }
  }

  async stopPlugin(pluginId: string): Promise<void> {
    const entry = this.plugins.get(pluginId);
    if (!entry) return;

    if (entry.plugin.stop && entry.status === 'started') {
      try {
        await entry.plugin.stop();
        entry.status = 'stopped';
      } catch (err) {
        entry.status = 'error';
        entry.error = err instanceof Error ? err.message : String(err);
      }
    }
  }

  async unregisterPlugin(pluginId: string): Promise<void> {
    const entry = this.plugins.get(pluginId);
    if (!entry) return;

    await this.stopPlugin(pluginId);
    try {
      await entry.plugin.destroy();
    } catch (_ignored) {
      // Best-effort cleanup
    }
    this.plugins.delete(pluginId);
  }

  enablePlugin(pluginId: string): void {
    const entry = this.plugins.get(pluginId);
    if (entry) entry.enabled = true;
  }

  disablePlugin(pluginId: string): void {
    const entry = this.plugins.get(pluginId);
    if (entry) entry.enabled = false;
  }

  getPluginMetadata(pluginId: string): PluginMetadata | undefined {
    const entry = this.plugins.get(pluginId);
    if (!entry) return undefined;

    return {
      id: entry.plugin.id,
      name: entry.plugin.name,
      version: entry.plugin.version,
      status: entry.status,
      capabilities: entry.plugin.capabilities || [],
      error: entry.error,
      enabled: entry.enabled
    };
  }

  listPlugins(): PluginMetadata[] {
    return Array.from(this.plugins.keys()).map(id => this.getPluginMetadata(id)!);
  }
}
