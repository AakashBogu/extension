import { IServiceContainer } from '../di/IServiceContainer';
import { IEventBus } from '../events/IEventBus';
import { IConfigLoader } from '../config/IConfig';
import { ILogger } from '../logger/ILogger';
import { StateManager } from '../state/StateManager';
import { PluginManager } from '../plugin/PluginManager';
import { AIProviderRegistry } from '../../providers/registry/AIProviderRegistry';
import { SearchProviderRegistry } from '../../providers/registry/SearchProviderRegistry';
import { SpeechProviderRegistry } from '../../providers/registry/SpeechProviderRegistry';
import { OCRProviderRegistry } from '../../providers/registry/OCRProviderRegistry';
import { StorageProviderRegistry } from '../../providers/registry/StorageProviderRegistry';

export interface RuntimeMetadata {
  readonly instanceId: string;
  readonly version: string;
  readonly env: string;
  readonly startTime: number;
}

export class ApplicationContext {
  constructor(
    public readonly container: IServiceContainer,
    public readonly eventBus: IEventBus,
    public readonly config: IConfigLoader,
    public readonly logger: ILogger,
    public readonly stateManager: StateManager,
    public readonly pluginManager: PluginManager,
    public readonly providerRegistries: {
      ai: AIProviderRegistry;
      search: SearchProviderRegistry;
      speech: SpeechProviderRegistry;
      ocr: OCRProviderRegistry;
      storage: StorageProviderRegistry;
    },
    public readonly runtimeMetadata: RuntimeMetadata
  ) {}
}
