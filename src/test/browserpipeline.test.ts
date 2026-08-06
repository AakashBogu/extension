import { describe, it, expect } from 'vitest';
import { BrowserPipeline } from '../core/browser/integration/BrowserPipeline';
import { EventBus } from '../core/events/EventBus';

describe('Module 2F: BrowserPipeline Integration', () => {
  it('should initialize and start end-to-end browser video pipeline', () => {
    const eventBus = new EventBus();
    const pipeline = new BrowserPipeline(eventBus);

    pipeline.initialize();
    pipeline.start();

    const status = pipeline.getStatus();
    expect(status.isInitialized).toBe(true);
    expect(status.isRunning).toBe(true);
    expect(status.healthy).toBe(true);

    pipeline.stop();
    expect(pipeline.getStatus().isRunning).toBe(false);
  });
});
