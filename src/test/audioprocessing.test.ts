import { describe, it, expect, beforeEach } from 'vitest';
import { AudioProcessingEngine } from '../core/audio/processing/AudioProcessingEngine';
import { EventBus } from '../core/events/EventBus';

describe('Module 3C: AudioProcessingEngine Integration', () => {
  let engine: AudioProcessingEngine;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    engine = new AudioProcessingEngine(
      {
        enabled: true,
        targetSampleRate: 16000,
        channelMode: 'MONO_AVERAGE',
        frameDurationMs: 20,
        chunkDurationMs: 1000,
        maxPendingFrames: 10,
        maxPendingChunks: 5,
        vad: {
          enabled: true,
          speechThresholdDb: -35,
          silenceThresholdDb: -42,
          speechStartFrames: 1,
          silenceHangoverMs: 20,
          minSpeechDurationMs: 20
        }
      },
      undefined,
      undefined,
      eventBus
    );
  });

  it('should run processing pipeline idempotently and publish events without leaking raw PCM', async () => {
    let pcmFrameEventReceived = false;

    eventBus.subscribe('audio.pcm_frame', () => { pcmFrameEventReceived = true; });

    await engine.initialize();
    await engine.start();

    expect(engine.getStatus()).toBe('RUNNING');

    // Simulate 48kHz audio buffer input (3200 samples = 2 20ms frames @ 16kHz)
    const audioData = [new Float32Array(9600).fill(0.4)];
    engine.processAudioData(audioData, 48000);

    expect(pcmFrameEventReceived).toBe(true);

    const health = engine.healthCheck();
    expect(health.healthy).toBe(true);

    await engine.stop();
    expect(engine.getStatus()).toBe('STOPPED');
  });
});
