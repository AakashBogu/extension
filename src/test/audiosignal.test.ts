import { describe, it, expect } from 'vitest';
import { AudioSignalAnalyzer } from '../core/audio/processing/AudioSignalAnalyzer';

describe('Module 3C: AudioSignalAnalyzer', () => {
  it('should compute RMS, peak, ZCR, and dB without producing NaN or Infinity', () => {
    const analyzer = new AudioSignalAnalyzer();

    const silence = new Float32Array(320).fill(0.0);
    const metricsSilence = analyzer.analyzeSignal(silence);

    expect(metricsSilence.rms).toBe(0);
    expect(metricsSilence.decibels).toBe(-100);

    // Sine wave mock
    const sine = new Float32Array(320);
    for (let i = 0; i < 320; i++) {
      sine[i] = Math.sin((i * Math.PI) / 10);
    }
    const metricsSine = analyzer.analyzeSignal(sine);

    expect(metricsSine.peak).toBeGreaterThan(0.9);
    expect(metricsSine.decibels).toBeGreaterThan(-10);
  });
});
