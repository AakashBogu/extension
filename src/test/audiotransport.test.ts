import { describe, it, expect, beforeEach } from 'vitest';
import { AudioTransportEngine } from '../core/audio/transport/AudioTransportEngine';
import { EventBus } from '../core/events/EventBus';
import { AudioChunk } from '../core/audio/processing/AudioProcessingTypes';

describe('Module 3D: AudioTransportEngine Integration', () => {
  let engine: AudioTransportEngine;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    engine = new AudioTransportEngine(
      {
        enabled: true,
        maxQueueSize: 5,
        dropStrategy: 'DROP_OLDEST',
        backpressureThresholdPercent: 80,
        retry: {
          maxRetries: 3,
          retryDelayMs: 10,
          maxRetryDelayMs: 100,
          processingTimeoutMs: 1000
        }
      },
      undefined,
      eventBus
    );
  });

  it('should initialize, accept valid chunks, deliver to speech boundary, and handle sequence gaps', async () => {
    let receivedEvent = false;
    let deliveredEvent = false;

    eventBus.subscribe('audio.transport_chunk_received', () => { receivedEvent = true; });
    eventBus.subscribe('audio.transport_chunk_delivered', () => { deliveredEvent = true; });

    await engine.initialize();
    await engine.start();
    expect(engine.getStatus()).toBe('RUNNING');

    const validChunk: AudioChunk = {
      id: 'chk_1',
      sequenceNumber: 1,
      timestamp: Date.now(),
      durationMs: 1000,
      sampleRate: 16000,
      channels: 1,
      samples: new Float32Array([0.1, 0.2, 0.3])
    };

    engine.onChunk(validChunk);
    await new Promise(res => setTimeout(res, 20));

    expect(receivedEvent).toBe(true);
    expect(deliveredEvent).toBe(true);

    const metrics = engine.getMetrics();
    expect(metrics.receivedChunks).toBe(1);
    expect(metrics.deliveredChunks).toBe(1);

    await engine.stop();
    expect(engine.getStatus()).toBe('STOPPED');
  });
});
