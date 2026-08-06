import { describe, it, expect } from 'vitest';
import { BrowserIntegrationManager } from '../core/browser/integration/BrowserIntegrationManager';
import { EventBus } from '../core/events/EventBus';

describe('Module 2F: BrowserIntegrationManager & Developer Harness', () => {
  it('should boot full browser integration facade and execute developer harness checks', () => {
    const eventBus = new EventBus();
    const manager = new BrowserIntegrationManager(eventBus);

    manager.boot();

    const status = manager.getPipelineStatus();
    expect(status.isRunning).toBe(true);

    const validation = manager.developerHarness.validateSite('YouTube');
    expect(validation.site).toBe('YouTube');
    expect(validation.success).toBe(true);

    manager.shutdown();
    expect(manager.getPipelineStatus().isRunning).toBe(false);
  });
});
