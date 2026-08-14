import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OffscreenCapabilityManager } from '../core/offscreen/OffscreenCapabilityManager';
import { OffscreenHealthMonitor } from '../core/offscreen/OffscreenHealthMonitor';
import { OffscreenDocumentManager } from '../core/offscreen/OffscreenDocumentManager';
import { AudioContextRuntime } from '../core/offscreen/AudioContextRuntime';
import { OffscreenBridge } from '../core/offscreen/OffscreenBridge';
import { EventBus } from '../core/events/EventBus';

describe('Module 3A: Capabilities & Health Monitoring', () => {
  let originalAudioContext: unknown;

  beforeEach(() => {
    const globalContext = globalThis as unknown as { AudioContext?: unknown };
    originalAudioContext = globalContext.AudioContext;
    if (!globalContext.AudioContext) {
      globalContext.AudioContext = class MockAudioContext {
        state = 'suspended';
        resume() { this.state = 'running'; return Promise.resolve(); }
        suspend() { this.state = 'suspended'; return Promise.resolve(); }
        close() { this.state = 'closed'; return Promise.resolve(); }
      };
    }
  });

  afterEach(() => {
    const globalContext = globalThis as unknown as { AudioContext?: unknown };
    globalContext.AudioContext = originalAudioContext;
  });

  it('should detect capabilities and report system health', async () => {
    const capabilityManager = new OffscreenCapabilityManager();
    const caps = capabilityManager.detectCapabilities();

    expect(caps.webAudioAvailable).toBe(true);

    const eventBus = new EventBus();
    const docManager = new OffscreenDocumentManager(eventBus);
    await docManager.createDocument();

    const audioRuntime = new AudioContextRuntime();
    audioRuntime.initialize();

    const bridge = new OffscreenBridge();
    const healthMonitor = new OffscreenHealthMonitor(docManager, audioRuntime, bridge, capabilityManager, eventBus);

    const health = await healthMonitor.checkHealth();
    expect(health.healthy).toBe(true);
  });
});
