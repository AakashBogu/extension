import { IServiceContainer, ServiceIdentifier } from './IServiceContainer';
import { ServiceNotFoundError, DuplicateServiceError, CircularDependencyError } from '../error/DIPluginErrors';
import { DependencyGraph } from './DependencyGraph';

export type ServiceLifetime = 'singleton' | 'scoped' | 'transient';

export interface BindingDefinition<T = unknown> {
  id: ServiceIdentifier<T>;
  lifetime: ServiceLifetime;
  value?: T;
  constructorFunc?: new (...args: unknown[]) => T;
  factoryFunc?: (container: IServiceContainer) => T;
  instance?: T;
}

export class ServiceContainer implements IServiceContainer {
  private bindings = new Map<string, BindingDefinition<unknown>>();
  private resolutionStack: string[] = [];
  private graph = new DependencyGraph();
  private parentContainer?: ServiceContainer;

  constructor(parent?: ServiceContainer) {
    this.parentContainer = parent;
  }

  bind<T>(id: ServiceIdentifier<T>): {
    toValue(value: T): void;
    toClass(constructor: new (...args: unknown[]) => T, lifetime?: ServiceLifetime): void;
    toFactory(factory: (container: IServiceContainer) => T, lifetime?: ServiceLifetime): void;
  } {
    const key = this.stringifyId(id);
    if (this.bindings.has(key)) {
      throw new DuplicateServiceError(key);
    }
    this.graph.addNode(id);

    return {
      toValue: (value: T) => {
        this.bindings.set(key, {
          id,
          lifetime: 'singleton',
          value,
          instance: value
        });
      },
      toClass: (constructor: new (...args: unknown[]) => T, lifetime: ServiceLifetime = 'singleton') => {
        this.bindings.set(key, {
          id,
          lifetime,
          constructorFunc: constructor
        });
      },
      toFactory: (factory: (container: IServiceContainer) => T, lifetime: ServiceLifetime = 'singleton') => {
        this.bindings.set(key, {
          id,
          lifetime,
          factoryFunc: factory
        });
      }
    };
  }

  get<T>(id: ServiceIdentifier<T>): T {
    const key = this.stringifyId(id);
    const binding = this.bindings.get(key);

    if (!binding) {
      if (this.parentContainer && this.parentContainer.has(id)) {
        return this.parentContainer.get<T>(id);
      }
      throw new ServiceNotFoundError(key);
    }

    if (this.resolutionStack.includes(key)) {
      const cycle = [...this.resolutionStack, key];
      this.resolutionStack = [];
      throw new CircularDependencyError(cycle);
    }

    this.resolutionStack.push(key);

    try {
      if (binding.lifetime === 'singleton' && binding.instance !== undefined) {
        return binding.instance as T;
      }

      let instance: T;

      if (binding.value !== undefined) {
        instance = binding.value as T;
      } else if (binding.factoryFunc) {
        instance = binding.factoryFunc(this) as T;
      } else if (binding.constructorFunc) {
        instance = new binding.constructorFunc() as T;
      } else {
        throw new ServiceNotFoundError(key);
      }

      if (binding.lifetime === 'singleton' || binding.lifetime === 'scoped') {
        binding.instance = instance;
      }

      return instance;
    } finally {
      this.resolutionStack.pop();
    }
  }

  has<T = unknown>(id: ServiceIdentifier<T>): boolean {
    const key = this.stringifyId(id);
    return this.bindings.has(key) || (this.parentContainer ? this.parentContainer.has(id) : false);
  }

  createScope(): ServiceContainer {
    return new ServiceContainer(this);
  }

  getDependencyGraph(): DependencyGraph {
    return this.graph;
  }

  private stringifyId(id: ServiceIdentifier): string {
    if (typeof id === 'string') return id;
    if (typeof id === 'symbol') return id.toString();
    return id.name || 'AnonymousConstructor';
  }
}
