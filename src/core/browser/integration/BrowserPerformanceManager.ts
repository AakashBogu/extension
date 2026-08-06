import { PerformanceReport } from './IntegrationTypes';

export class BrowserPerformanceManager {
  private lastDiscoveryDurationMs = 0;
  private lastSelectionDurationMs = 0;
  private activeListenersCount = 0;

  recordDiscoveryDuration(durationMs: number): void {
    this.lastDiscoveryDurationMs = durationMs;
  }

  recordSelectionDuration(durationMs: number): void {
    this.lastSelectionDurationMs = durationMs;
  }

  setActiveListenersCount(count: number): void {
    this.activeListenersCount = count;
  }

  generatePerformanceReport(): PerformanceReport {
    const perf = typeof performance !== 'undefined'
      ? (performance as Performance & { memory?: { usedJSHeapSize: number } })
      : null;

    return {
      timestamp: Date.now(),
      discoveryLatencyMs: this.lastDiscoveryDurationMs,
      selectionLatencyMs: this.lastSelectionDurationMs,
      activeListenersCount: this.activeListenersCount,
      memoryUsageEstimateBytes: perf && perf.memory ? perf.memory.usedJSHeapSize : 0
    };
  }
}
