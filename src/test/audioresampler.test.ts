import { describe, it, expect } from 'vitest';
import { AudioResampler } from '../core/audio/processing/AudioResampler';
import { ResamplingError } from '../core/error/AudioProcessingErrors';

describe('Module 3C: AudioResampler', () => {
  it('should resample 48kHz audio to 16kHz with correct sample count', () => {
    const resampler = new AudioResampler();

    expect(() => resampler.resample(new Float32Array(10), 0, 16000)).toThrow(ResamplingError);

    // 48000 samples @ 48kHz = 1 second
    const input48k = new Float32Array(48000).fill(0.5);
    const output16k = resampler.resample(input48k, 48000, 16000);

    expect(output16k.length).toBe(16000);
    expect(output16k[0]).toBe(0.5);
  });

  it('should handle identity resampling efficiently', () => {
    const resampler = new AudioResampler();
    const input16k = new Float32Array(100).fill(0.2);
    const output = resampler.resample(input16k, 16000, 16000);

    expect(output).toBe(input16k);
  });
});
