import { ExtendedAppConfig } from '../ConfigTypes';

export interface IConfigurationProvider {
  readonly name: string;
  load(): Promise<Partial<ExtendedAppConfig>>;
  save(config: Partial<ExtendedAppConfig>): Promise<void>;
}
