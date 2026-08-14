import { describe, it, expect } from 'vitest';
import { OffscreenBridge } from '../core/offscreen/OffscreenBridge';
import { OffscreenMessageRouter } from '../core/offscreen/OffscreenMessageRouter';
import { AudioContextRuntime } from '../core/offscreen/AudioContextRuntime';
import { OffscreenMessage } from '../core/offscreen/OffscreenRuntimeTypes';

describe('Module 3A: Offscreen Messaging & Bridge Protocol', () => {
  it('should route typed messages with correlation IDs', async () => {
    const bridge = new OffscreenBridge();
    const audioRuntime = new AudioContextRuntime();
    const router = new OffscreenMessageRouter(bridge, audioRuntime);

    const msg: OffscreenMessage = {
      messageId: 'msg_1',
      type: 'OFFSCREEN_INIT',
      timestamp: Date.now(),
      source: 'service-worker',
      target: 'offscreen-document',
      correlationId: 'corr_1',
      payload: {},
      version: '1.0.0'
    };

    expect(router.validateMessage(msg)).toBe(true);
    await bridge.send(msg);
    expect(audioRuntime.getState()).toBe('suspended');
  });
});
