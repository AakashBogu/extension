import { ProviderExecutionMetrics } from './ProviderExecutionTypes';

export class ProviderExecutionMetricsCollector {
  private metrics: ProviderExecutionMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cancelledRequests: 0,
    timedOutRequests: 0,
    retryAttempts: 0,
    fallbackAttempts: 0,
    averageLatencyMs: 0,
    maxLatencyMs: 0,
    activeRequests: 0,
    peakConcurrentRequests: 0
  };

  private latencies: number[] = [];

  recordRequestCreated(): void {
    this.metrics.totalRequests++;
    this.metrics.activeRequests++;
    if (this.metrics.activeRequests > this.metrics.peakConcurrentRequests) {
      this.metrics.peakConcurrentRequests = this.metrics.activeRequests;
    }
  }

  recordSuccess(latencyMs: number): void {
    this.metrics.activeRequests = Math.max(0, this.metrics.activeRequests - 1);
    this.metrics.successfulRequests++;
    this.latencies.push(latencyMs);

    if (latencyMs > this.metrics.maxLatencyMs) {
      this.metrics.maxLatencyMs = latencyMs;
    }

    const sum = this.latencies.reduce((a, b) => a + b, 0);
    this.metrics.averageLatencyMs = Math.round(sum / this.latencies.length);
  }

  recordFailure(): void {
    this.metrics.activeRequests = Math.max(0, this.metrics.activeRequests - 1);
    this.metrics.failedRequests++;
  }

  recordCancelled(): void {
    this.metrics.activeRequests = Math.max(0, this.metrics.activeRequests - 1);
    this.metrics.cancelledRequests++;
  }

  recordTimeout(): void {
    this.metrics.timedOutRequests++;
  }

  recordRetry(): void {
    this.metrics.retryAttempts++;
  }

  recordFallback(): void {
    this.metrics.fallbackAttempts++;
  }

  getMetrics(): ProviderExecutionMetrics {
    return { ...this.metrics };
  }

  clear(): void {
    this.latencies = [];
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cancelledRequests: 0,
      timedOutRequests: 0,
      retryAttempts: 0,
      fallbackAttempts: 0,
      averageLatencyMs: 0,
      maxLatencyMs: 0,
      activeRequests: 0,
      peakConcurrentRequests: 0
    };
  }
}
