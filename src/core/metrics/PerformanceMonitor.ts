export interface OperationTiming {
  operationName: string;
  count: number;
  totalDurationMs: number;
  avgDurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
}

export class PerformanceMonitor {
  private timings = new Map<string, OperationTiming>();

  startTimer(operationName: string): () => number {
    const startMs = Date.now();
    return () => {
      const durationMs = Date.now() - startMs;
      this.recordTiming(operationName, durationMs);
      return durationMs;
    };
  }

  recordTiming(operationName: string, durationMs: number): void {
    const existing = this.timings.get(operationName);
    if (!existing) {
      this.timings.set(operationName, {
        operationName,
        count: 1,
        totalDurationMs: durationMs,
        avgDurationMs: durationMs,
        minDurationMs: durationMs,
        maxDurationMs: durationMs
      });
    } else {
      existing.count++;
      existing.totalDurationMs += durationMs;
      existing.avgDurationMs = existing.totalDurationMs / existing.count;
      existing.minDurationMs = Math.min(existing.minDurationMs, durationMs);
      existing.maxDurationMs = Math.max(existing.maxDurationMs, durationMs);
    }
  }

  getTiming(operationName: string): OperationTiming | undefined {
    return this.timings.get(operationName);
  }

  getAllTimings(): OperationTiming[] {
    return Array.from(this.timings.values());
  }
}
