import { IConfigurationProvider } from './IConfigurationProvider';
import { ExtendedAppConfig } from '../ConfigTypes';

export class MemoryConfigurationProvider implements IConfigurationProvider {
  readonly name = 'MemoryProvider';
  private data: Partial<ExtendedAppConfig> = {};

  constructor(initialData: Partial<ExtendedAppConfig> = {}) {
    this.data = { ...initialData };
  }

  async load(): Promise<Partial<ExtendedAppConfig>> {
    return JSON.parse(JSON.stringify(this.data));
  }

  async save(config: Partial<ExtendedAppConfig>): Promise<void> {
    this.data = { ...this.data, ...JSON.parse(JSON.stringify(config)) };
  }
}
