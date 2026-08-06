import { IPlugin } from './IPlugin';

export type PluginStatus = 'uninitialized' | 'initialized' | 'started' | 'stopped' | 'error';

export interface IExtendedPlugin extends IPlugin {
  start?(): Promise<void>;
  stop?(): Promise<void>;
  capabilities?: string[];
  dependencies?: string[];
}

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  status: PluginStatus;
  capabilities: string[];
  error?: string;
  enabled: boolean;
}
