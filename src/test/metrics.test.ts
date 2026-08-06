import { describe, it, expect } from 'vitest';
import { MetricsManager } from '../core/metrics/MetricsManager';
import { PerformanceMonitor } from '../core/metrics/PerformanceMonitor';

describe('Module 1F: Metrics & Performance Monitor', () => {
  it('should increment counters and update gauges', () => {
    const metrics = new MetricsManager();
    metrics.incrementCounter('claims_processed_total', 1);
    metrics.incrementCounter('claims_processed_total', 2);
    metrics.setGauge('queue_length', 5);

    expect(metrics.getMetric('claims_processed_total')?.value).toBe(3);
    expect(metrics.getMetric('queue_length')?.value).toBe(5);
  });

  it('should compute average and max duration in PerformanceMonitor', () => {
    const monitor = new PerformanceMonitor();
    monitor.recordTiming('stt_transcription', 100);
    monitor.recordTiming('stt_transcription', 200);

    const timing = monitor.getTiming('stt_transcription');
    expect(timing?.count).toBe(2);
    expect(timing?.avgDurationMs).toBe(150);
    expect(timing?.maxDurationMs).toBe(200);
  });
});
