import { ProviderReliabilityMetrics } from './ProviderHealthTypes';
import { ProviderLatencyTracker } from './ProviderLatencyTracker';

export class ProviderReliabilityTracker {
  private metricsMap = new Map<string, {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    retryableFailures: number;
    nonRetryableFailures: number;
    consecutiveFailures: number;
    consecutiveSuccesses: number;
    lastSuccessAt?: number;
    lastFailureAt?: number;
  }>();

  constructor(private latencyTracker: ProviderLatencyTracker) {}

  recordOutcome(
    providerId: string,
    outcome: 'SUCCESS' | 'RETRYABLE_FAILURE' | 'NON_RETRYABLE_FAILURE',
    latencyMs?: number
  ): void {
    const m = this.metricsMap.get(providerId) || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retryableFailures: 0,
      nonRetryableFailures: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0
    };

    m.totalRequests++;

    if (outcome === 'SUCCESS') {
      m.successfulRequests++;
      m.consecutiveSuccesses++;
      m.consecutiveFailures = 0;
      m.lastSuccessAt = Date.now();
      if (typeof latencyMs === 'number') {
        this.latencyTracker.recordLatency(providerId, latencyMs);
      }
    } else {
      m.failedRequests++;
      m.consecutiveFailures++;
      m.consecutiveSuccesses = 0;
      m.lastFailureAt = Date.now();
      if (outcome === 'RETRYABLE_FAILURE') m.retryableFailures++;
      if (outcome === 'NON_RETRYABLE_FAILURE') m.nonRetryableFailures++;
    }

    this.metricsMap.set(providerId, m);
  }

  getMetrics(providerId: string): ProviderReliabilityMetrics {
    const m = this.metricsMap.get(providerId) || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retryableFailures: 0,
      nonRetryableFailures: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0
    };

    const total = m.totalRequests;
    const successRate = total > 0 ? parseFloat((m.successfulRequests / total).toFixed(4)) : 1.0;
    const failureRate = total > 0 ? parseFloat((m.failedRequests / total).toFixed(4)) : 0.0;

    return {
      providerId,
      totalRequests: m.totalRequests,
      successfulRequests: m.successfulRequests,
      failedRequests: m.failedRequests,
      retryableFailures: m.retryableFailures,
      nonRetryableFailures: m.nonRetryableFailures,
      successRate,
      failureRate,
      averageLatencyMs: this.latencyTracker.getAverageLatency(providerId),
      p50LatencyMs: this.latencyTracker.getPercentileLatency(providerId, 50),
      p95LatencyMs: this.latencyTracker.getPercentileLatency(providerId, 95),
      consecutiveFailures: m.consecutiveFailures,
      consecutiveSuccesses: m.consecutiveSuccesses,
      lastSuccessAt: m.lastSuccessAt,
      lastFailureAt: m.lastFailureAt
    };
  }

  reset(providerId?: string): void {
    if (providerId) {
      this.metricsMap.delete(providerId);
      this.latencyTracker.clear(providerId);
    } else {
      this.metricsMap.clear();
      this.latencyTracker.clear();
    }
  }
}
