/// <reference types="vite/client" />
import { AppConfig, IConfigLoader } from './IConfig';

export class ConfigLoader implements IConfigLoader {
  private config: AppConfig = {
    env: (import.meta.env.MODE as 'development' | 'production' | 'test') || 'development',
    logLevel: 'info',
    defaultAiProvider: 'gemini-1.5-flash',
    defaultSearchProvider: 'tavily',
    maxTokensPerDay: 100000,
    enableDebugConsole: true
  };

  async loadConfig(): Promise<AppConfig> {
    return this.config;
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }
}
