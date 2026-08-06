import { IConfigurationProvider } from './IConfigurationProvider';
import { ExtendedAppConfig } from '../ConfigTypes';

export class JSONConfigurationProvider implements IConfigurationProvider {
  readonly name = 'JSONProvider';
  private jsonStr: string;

  constructor(jsonStr: string = '{}') {
    this.jsonStr = jsonStr;
  }

  async load(): Promise<Partial<ExtendedAppConfig>> {
    try {
      return JSON.parse(this.jsonStr) as Partial<ExtendedAppConfig>;
    } catch (_err) {
      return {};
    }
  }

  async save(config: Partial<ExtendedAppConfig>): Promise<void> {
    this.jsonStr = JSON.stringify(config);
  }
}
