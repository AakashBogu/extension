import { describe, it, expect } from 'vitest';
import { BrowserHealthMonitor } from '../core/browser/integration/BrowserHealthMonitor';
import { VideoRegistry } from '../core/video/VideoRegistry';
import { ActiveVideoManager } from '../core/video/selection/ActiveVideoManager';
import { EventBus } from '../core/events/EventBus';

describe('Module 2F: BrowserHealthMonitor', () => {
  it('should run complete browser health check report', async () => {
    const eventBus = new EventBus();
    const registry = new VideoRegistry(50, eventBus);
    const activeVideoManager = new ActiveVideoManager(eventBus);

    const healthMonitor = new BrowserHealthMonitor(registry, activeVideoManager, eventBus);
    const report = await healthMonitor.runHealthCheck();

    expect(report.overallHealth).toBe('HEALTHY');
    expect(report.components.browserRuntime).toBe(true);
    expect(report.components.videoDiscovery).toBe(true);
  });
});
