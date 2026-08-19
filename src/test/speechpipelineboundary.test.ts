import { describe, it, expect } from 'vitest';
import { SpeechPipelineBoundary, NullSpeechPipelineAdapter } from '../core/audio/transport/SpeechPipelineBoundary';
import { AudioChunk } from '../core/audio/processing/AudioProcessingTypes';

describe('Module 3D: SpeechPipelineBoundary', () => {
  it('should accept chunks through NullSpeechPipelineAdapter and maintain health metrics', async () => {
    const nullAdapter = new NullSpeechPipelineAdapter();
    const boundary = new SpeechPipelineBoundary(nullAdapter);

    await boundary.initialize();

    const chunk: AudioChunk = {
      id: 'chk_1',
      sequenceNumber: 1,
      timestamp: Date.now(),
      durationMs: 1000,
      sampleRate: 16000,
      channels: 1,
      samples: new Float32Array([0.1, 0.2, 0.3])
    };

    await boundary.acceptAudioChunk(chunk);

    const health = await boundary.healthCheck();
    expect(health.ready).toBe(true);
    expect(health.processedChunksCount).toBe(1);
  });
});
