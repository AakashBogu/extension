import { IServiceContainer } from './IServiceContainer';
import { IModuleRegistrar } from './IModuleRegistrar';

export class ServiceRegistry {
  private registrars: Map<string, IModuleRegistrar> = new Map();

  registerModule(registrar: IModuleRegistrar, container: IServiceContainer): void {
    if (this.registrars.has(registrar.moduleName)) {
      return;
    }
    registrar.register(container);
    this.registrars.set(registrar.moduleName, registrar);
  }

  isModuleRegistered(moduleName: string): boolean {
    return this.registrars.has(moduleName);
  }
}
