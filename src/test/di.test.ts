import { describe, it, expect, beforeEach } from 'vitest';
import { ServiceContainer } from '../core/di/ServiceContainer';
import { DuplicateServiceError, ServiceNotFoundError, CircularDependencyError } from '../core/error/DIPluginErrors';

describe('Module 1B: Dependency Injection Container', () => {
  let container: ServiceContainer;

  beforeEach(() => {
    container = new ServiceContainer();
  });

  it('should register and resolve a value singleton', () => {
    container.bind('CONFIG_KEY').toValue('secret_123');
    expect(container.get<string>('CONFIG_KEY')).toBe('secret_123');
  });

  it('should resolve singleton lifetime correctly', () => {
    class DummyService {
      public count = 0;
    }
    container.bind('Dummy').toClass(DummyService, 'singleton');

    const s1 = container.get<DummyService>('Dummy');
    s1.count = 42;
    const s2 = container.get<DummyService>('Dummy');
    expect(s2.count).toBe(42);
    expect(s1).toBe(s2);
  });

  it('should resolve transient lifetime correctly', () => {
    class TransientService {
      public id = Math.random();
    }
    container.bind('Transient').toClass(TransientService, 'transient');

    const t1 = container.get<TransientService>('Transient');
    const t2 = container.get<TransientService>('Transient');
    expect(t1.id).not.toBe(t2.id);
  });

  it('should resolve factory bindings correctly', () => {
    container.bind('Factoried').toFactory(() => ({ name: 'factory_resolved' }));
    expect(container.get<{ name: string }>('Factoried').name).toBe('factory_resolved');
  });

  it('should throw DuplicateServiceError on double registration', () => {
    container.bind('ServiceA').toValue(1);
    expect(() => container.bind('ServiceA').toValue(2)).toThrow(DuplicateServiceError);
  });

  it('should throw ServiceNotFoundError on unregistered resolution', () => {
    expect(() => container.get('NonExistent')).toThrow(ServiceNotFoundError);
  });

  it('should detect circular dependency cycles', () => {
    const graph = container.getDependencyGraph();
    graph.addEdge('A', 'B');
    graph.addEdge('B', 'C');
    graph.addEdge('C', 'A');

    expect(() => graph.detectCycles()).toThrow(CircularDependencyError);
  });

  it('should support scoped child containers', () => {
    container.bind('ParentVal').toValue('parent');
    const child = container.createScope();
    child.bind('ChildVal').toValue('child');

    expect(child.get('ParentVal')).toBe('parent');
    expect(child.get('ChildVal')).toBe('child');
    expect(container.has('ChildVal')).toBe(false);
  });
});
