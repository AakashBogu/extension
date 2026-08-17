import { describe, it, expect } from 'vitest';
import { PCMExtractor } from '../core/audio/processing/PCMExtractor';
import { PCMExtractionError } from '../core/error/AudioProcessingErrors';

describe('Module 3C: PCMExtractor', () => {
  it('should extract and sanitize NaN and Infinity Float32 samples', () => {
    const extractor = new PCMExtractor();

    expect(() => extractor.extractPCM([])).toThrow(PCMExtractionError);

    const dirtyBuffer = new Float32Array([0.5, NaN, Infinity, -2.0, 0.8]);
    const clean = extractor.extractPCM([dirtyBuffer]);

    expect(clean.length).toBe(1);
    expect(clean[0][0]).toBeCloseTo(0.5);
    expect(clean[0][1]).toBe(0.0);
    expect(clean[0][2]).toBe(0.0);
    expect(clean[0][3]).toBe(-1.0); // Clamped
    expect(clean[0][4]).toBeCloseTo(0.8);
  });
});
