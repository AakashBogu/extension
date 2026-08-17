import { describe, it, expect } from 'vitest';
import { AudioFrameGenerator } from '../core/audio/processing/AudioFrameGenerator';

describe('Module 3C: AudioFrameGenerator', () => {
  it('should slice continuous samples into exact 20ms frames @ 16kHz (320 samples)', () => {
    const generator = new AudioFrameGenerator(20, 16000, 1);
    expect(generator.frameSize).toBe(320);

    // Push 700 samples -> 2 full frames (640 samples) + 60 leftover
    const samples = new Float32Array(700).fill(0.1);
    const frames = generator.pushSamples(samples);

    expect(frames.length).toBe(2);
    expect(frames[0].samples.length).toBe(320);
    expect(frames[1].samples.length).toBe(320);

    // Flush leftover 60 samples
    const flushed = generator.flush();
    expect(flushed).not.toBeNull();
    expect(flushed?.samples.length).toBe(60);
  });
});
