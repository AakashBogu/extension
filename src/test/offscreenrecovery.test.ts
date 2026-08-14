import { describe, it, expect } from 'vitest';
import { OffscreenRecoveryManager } from '../core/offscreen/OffscreenRecoveryManager';
import { OffscreenDocumentManager } from '../core/offscreen/OffscreenDocumentManager';
import { AudioContextRuntime } from '../core/offscreen/AudioContextRuntime';
import { EventBus } from '../core/events/EventBus';

describe('Module 3A: Recovery Manager & Exponential Backoff', () => {
  it('should attempt recovery with backoff and respect retry limits', async () => {
    const eventBus = new EventBus();
    const docManager = new OffscreenDocumentManager(eventBus);
    const audioRuntime = new AudioContextRuntime();
    const recoveryManager = new OffscreenRecoveryManager(docManager, audioRuntime, 2, 10, eventBus);

    await recoveryManager.recover('Simulated crash');
    expect(recoveryManager.getRecoveryCount()).toBe(1);

    await recoveryManager.recover('Second crash');
    expect(recoveryManager.getRecoveryCount()).toBe(2);

    await expect(recoveryManager.recover('Third crash')).rejects.toThrow();
  });
});
