export class ProviderLatencyTracker {
  private samplesMap = new Map<string, number[]>();

  constructor(private readonly maxSamplesPerProvider: number = 200) {}

  recordLatency(providerId: string, latencyMs: number): void {
    if (latencyMs < 0 || !Number.isFinite(latencyMs)) return;
    const samples = this.samplesMap.get(providerId) || [];
    samples.push(Math.round(latencyMs));
    if (samples.length > this.maxSamplesPerProvider) {
      samples.shift(); // Maintain fixed-size ring buffer
    }
    this.samplesMap.set(providerId, samples);
  }

  getAverageLatency(providerId: string): number {
    const samples = this.samplesMap.get(providerId);
    if (!samples || samples.length === 0) return 0;
    const sum = samples.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / samples.length);
  }

  getPercentileLatency(providerId: string, percentile: number): number {
    const samples = this.samplesMap.get(providerId);
    if (!samples || samples.length === 0) return 0;
    const sorted = [...samples].sort((a, b) => a - b);
    const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((percentile / 100) * sorted.length)));
    return sorted[index];
  }

  clear(providerId?: string): void {
    if (providerId) {
      this.samplesMap.delete(providerId);
    } else {
      this.samplesMap.clear();
    }
  }
}
