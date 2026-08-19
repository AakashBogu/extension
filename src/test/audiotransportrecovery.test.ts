import { describe, it, expect } from 'vitest';
import { AudioTransportRecoveryManager } from '../core/audio/transport/AudioTransportRecoveryManager';
import { NullSpeechPipelineAdapter } from '../core/audio/transport/SpeechPipelineBoundary';
import { EventBus } from '../core/events/EventBus';

describe('Module 3D: AudioTransportRecoveryManager', () => {
  it('should recover speech pipeline boundary with backoff and respect retry limits', async () => {
    const adapter = new NullSpeechPipelineAdapter();
    const eventBus = new EventBus();
    const recoveryManager = new AudioTransportRecoveryManager(adapter, 2, 10, eventBus);

    await recoveryManager.recover('Simulated transport boundary glitch');
    expect(recoveryManager.getRecoveryCount()).toBe(1);

    await recoveryManager.recover('Second glitch');
    expect(recoveryManager.getRecoveryCount()).toBe(2);

    await expect(recoveryManager.recover('Third glitch')).rejects.toThrow();
  });
});
