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
    expect(context.runtimeMetadata.instanceId).toBeDefined();

    await kernel.shutdown();
    expect(kernel.getContext()).toBeNull();
  });
});
