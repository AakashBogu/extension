import { describe, it, expect } from 'vitest';
import { AudioTransportHealthMonitor } from '../core/audio/transport/AudioTransportHealthMonitor';
import { AudioChunkQueue } from '../core/audio/transport/AudioChunkQueue';
import { NullSpeechPipelineAdapter } from '../core/audio/transport/SpeechPipelineBoundary';
import { EventBus } from '../core/events/EventBus';

describe('Module 3D: AudioTransportHealthMonitor', () => {
  it('should compute queue saturation and transition health states', async () => {
    const queue = new AudioChunkQueue(5, 'DROP_OLDEST');
    const adapter = new NullSpeechPipelineAdapter();
    await adapter.initialize();
    const eventBus = new EventBus();

    const monitor = new AudioTransportHealthMonitor(queue, adapter, eventBus);
    const health = await monitor.checkHealth();

    expect(health.status).toBe('HEALTHY');
    expect(health.queueSaturationPercent).toBe(0);
  });
});
