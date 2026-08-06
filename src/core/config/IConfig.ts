/**
 * Configuration & Feature Flag Interfaces
 */
export interface AppConfig {
  env: 'development' | 'production' | 'test';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  defaultAiProvider: string;
  defaultSearchProvider: string;
  maxTokensPerDay: number;
  enableDebugConsole: boolean;
}

export interface IConfigLoader {
  loadConfig(): Promise<AppConfig>;
  get<K extends keyof AppConfig>(key: K): AppConfig[K];
}
