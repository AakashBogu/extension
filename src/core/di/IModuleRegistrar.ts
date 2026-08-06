import { IServiceContainer } from './IServiceContainer';

export interface IModuleRegistrar {
  readonly moduleName: string;
  register(container: IServiceContainer): void;
}
