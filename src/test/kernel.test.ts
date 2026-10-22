import { describe, it, expect } from 'vitest';
import { ApplicationKernel } from '../core/kernel/ApplicationKernel';
import { ApplicationContext } from '../core/kernel/ApplicationContext';

describe('Module 1D: Application Kernel & Context', () => {
  it('should boot ApplicationKernel and return ApplicationContext with all services bound', async () => {
    const kernel = new ApplicationKernel();
    const context = await kernel.boot();

    expect(context).toBeInstanceOf(ApplicationContext);
    expect(context.container.has('IServiceContainer')).toBe(true);
    expect(context.container.has('IEventBus')).toBe(true);
    expect(context.container.has('StateManager')).toBe(true);
    expect(context.container.has('ProviderExecutionEngine')).toBe(true);
    expect(context.container.has('VerificationEngine')).toBe(true);
    expect(context.container.has('ProviderObservabilityManager')).toBe(true);
    expect(context.container.has('MetricsManager')).toBe(true);
    expect(context.container.has('ProviderHealthManager')).toBe(true);
    expect(context.runtimeMetadata.instanceId).toBeDefined();
    expect(context.executionEngine).toBeDefined();
    expect(context.verificationEngine).toBeDefined();
    expect(context.verificationEngine?.getStatus()).toBe('RUNNING');

    await kernel.shutdown();
    expect(kernel.getContext()).toBeNull();
  });
});
