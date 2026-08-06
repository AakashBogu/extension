import { IConfigLoader, AppConfig } from './IConfig';
import { ExtendedAppConfig, ConfigSnapshot } from './ConfigTypes';
import { IConfigurationProvider } from './providers/IConfigurationProvider';
import { MemoryConfigurationProvider } from './providers/MemoryConfigurationProvider';
import { ConfigurationValidator } from './ConfigurationValidator';
import { IEventBus } from '../events/IEventBus';
import { StateManager } from '../state/StateManager';

export type ConfigChangeListener = (config: ExtendedAppConfig) => void;

export class ConfigurationManager implements IConfigLoader {
  private currentConfig: ExtendedAppConfig;
  private provider: IConfigurationProvider;
  private validator: ConfigurationValidator;
  private eventBus?: IEventBus;
  private stateManager?: StateManager;
  private listeners = new Set<ConfigChangeListener>();
  private snapshots: ConfigSnapshot[] = [];

  constructor(
    provider?: IConfigurationProvider,
    eventBus?: IEventBus,
    stateManager?: StateManager
  ) {
    this.provider = provider || new MemoryConfigurationProvider();
    this.validator = new ConfigurationValidator();
    this.eventBus = eventBus;
    this.stateManager = stateManager;

    this.currentConfig = this.createDefaultConfig();
  }

  async loadConfig(): Promise<AppConfig> {
    const loaded = await this.provider.load();
    this.currentConfig = {
      ...this.currentConfig,
      ...loaded
    };
    this.validator.validate(this.currentConfig);

    if (this.eventBus) {
      this.eventBus.publish('system.config_changed', this.currentConfig);
    }
    if (this.stateManager) {
      this.stateManager.getStore().setState({ configuration: this.currentConfig });
    }

    return this.currentConfig;
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.currentConfig[key];
  }

  getFullConfig(): ExtendedAppConfig {
    return { ...this.currentConfig };
  }

  async updateConfig(partial: Partial<ExtendedAppConfig>): Promise<void> {
    const nextConfig: ExtendedAppConfig = {
      ...this.currentConfig,
      ...partial
    };

    this.validator.validate(nextConfig);
    this.createSnapshot();

    this.currentConfig = nextConfig;
    await this.provider.save(nextConfig);

    this.listeners.forEach(l => l(nextConfig));

    if (this.eventBus) {
      this.eventBus.publish('system.config_changed', nextConfig);
    }
    if (this.stateManager) {
      this.stateManager.getStore().setState({ configuration: nextConfig });
    }
  }

  onChange(listener: ConfigChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  createSnapshot(): ConfigSnapshot {
    const snapshot: ConfigSnapshot = {
      id: `snap_cfg_${Date.now()}_${this.snapshots.length + 1}`,
      timestamp: Date.now(),
      version: this.currentConfig.version,
      config: JSON.parse(JSON.stringify(this.currentConfig))
    };
    this.snapshots.push(snapshot);
    return snapshot;
  }

  rollback(): void {
    const lastSnap = this.snapshots.pop();
    if (lastSnap) {
      this.currentConfig = lastSnap.config;
      this.listeners.forEach(l => l(this.currentConfig));
    }
  }

  private createDefaultConfig(): ExtendedAppConfig {
    return {
      version: 1,
      env: 'development',
      environment: 'development',
      logLevel: 'info',
      defaultAiProvider: 'gemini-1.5-flash',
      defaultSearchProvider: 'tavily',
      maxTokensPerDay: 100000,
      enableDebugConsole: true,
      logging: { level: 'info', enableConsole: true, maxLogEntries: 1000 },
      providersSection: { ai: 'gemini', search: 'tavily', speech: 'webspeech', ocr: 'tesseract', storage: 'indexeddb' },
      uiSection: { theme: 'dark', accentColor: '#0284c7' },
      overlaySection: { defaultPosition: { x: 16, y: 16 }, autoHideTimeoutMs: 5000 },
      securitySection: { enforceCsp: true, encryptSecrets: true },
      privacySection: { telemetryEnabled: false, zeroDataEgress: false },
      networkSection: { apiTimeoutMs: 10000, maxRetries: 3 }
    };
  }
}
