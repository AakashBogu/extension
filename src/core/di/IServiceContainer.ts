/**
 * Dependency Injection Container Interface (Module 1B Contract)
 */
export type ServiceIdentifier<T = unknown> = string | symbol | (new (...args: unknown[]) => T);

export interface IServiceContainer {
  bind<T>(id: ServiceIdentifier<T>): {
    toValue(value: T): void;
    toClass(constructor: new (...args: unknown[]) => T): void;
    toFactory(factory: (container: IServiceContainer) => T): void;
  };
  get<T>(id: ServiceIdentifier<T>): T;
  has<T = unknown>(id: ServiceIdentifier<T>): boolean;
}
