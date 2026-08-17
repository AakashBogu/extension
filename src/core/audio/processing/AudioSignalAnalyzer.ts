import { AudioSignalMetrics } from './AudioProcessingTypes';

export class AudioSignalAnalyzer {
  analyzeSignal(samples: Float32Array): AudioSignalMetrics {
    const timestamp = Date.now();
    if (!samples || samples.length === 0) {
      return { rms: 0, peak: 0, zeroCrossingRate: 0, decibels: -100, timestamp };
    }

    let sumSq = 0;
    let peak = 0;
    let zeroCrossings = 0;

    for (let i = 0; i < samples.length; i++) {
      const val = samples[i];
      const absVal = Math.abs(val);
      if (absVal > peak) peak = absVal;
      sumSq += val * val;

      if (i > 0) {
        if ((samples[i - 1] >= 0 && val < 0) || (samples[i - 1] < 0 && val >= 0)) {
          zeroCrossings++;
        }
      }
    }

    const rms = Math.sqrt(sumSq / samples.length);
    const zcr = zeroCrossings / samples.length;

    const epsilon = 1e-7;
    const safeRms = Math.max(rms, epsilon);
    const db = 20 * Math.log10(safeRms);

    return {
      rms: Number.isNaN(rms) ? 0 : rms,
      peak: Number.isNaN(peak) ? 0 : peak,
      zeroCrossingRate: Number.isNaN(zcr) ? 0 : zcr,
      decibels: Number.isNaN(db) ? -100 : Math.max(-100, Math.min(0, db)),
      timestamp
    };
  }
}
