import { AggregateUsageMetrics } from './ProviderUsageTrackerTypes';
import { ProviderUsageRecord } from './ProviderUsageTypes';

export class ProviderUsageMetricsCollector {
  private metricsMap = new Map<string, AggregateUsageMetrics>();

  getOrCreateMetrics(entityKey: string): AggregateUsageMetrics {
    let metrics = this.metricsMap.get(entityKey);
    if (!metrics) {
      metrics = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        attemptCount: 0,
        retryCount: 0,
        fallbackCount: 0,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0,
        totalDurationMs: 0,
        averageDurationMs: 0,
        currentConcurrentRequests: 0,
        peakConcurrentRequests: 0
      };
      this.metricsMap.set(entityKey, metrics);
    }
    return metrics;
  }

  recordRequestStart(entityKey: string): void {
    const m = this.getOrCreateMetrics(entityKey);
    m.currentConcurrentRequests++;
    if (m.currentConcurrentRequests > m.peakConcurrentRequests) {
      m.peakConcurrentRequests = m.currentConcurrentRequests;
    }
  }

  recordRequestSuccess(entityKey: string, record: ProviderUsageRecord): void {
    const m = this.getOrCreateMetrics(entityKey);
    m.currentConcurrentRequests = Math.max(0, m.currentConcurrentRequests - 1);
    m.totalRequests++;
    m.successfulRequests++;
    m.attemptCount += record.requestCount || 1;
    m.totalDurationMs += record.durationMs || 0;
    m.averageDurationMs = Math.round(m.totalDurationMs / (m.successfulRequests + m.failedRequests));

    if (typeof record.totalTokens === 'number') m.totalTokens += record.totalTokens;
    if (typeof record.inputTokens === 'number') m.inputTokens += record.inputTokens;
    if (typeof record.outputTokens === 'number') m.outputTokens += record.outputTokens;
    if (typeof record.estimatedCost === 'number') m.estimatedCost += record.estimatedCost;
  }

  recordRequestFailure(entityKey: string, record: ProviderUsageRecord): void {
    const m = this.getOrCreateMetrics(entityKey);
    m.currentConcurrentRequests = Math.max(0, m.currentConcurrentRequests - 1);
    m.totalRequests++;
    m.failedRequests++;
    m.attemptCount += record.requestCount || 1;
    m.totalDurationMs += record.durationMs || 0;
    if (m.successfulRequests + m.failedRequests > 0) {
      m.averageDurationMs = Math.round(m.totalDurationMs / (m.successfulRequests + m.failedRequests));
    }

    if (typeof record.totalTokens === 'number') m.totalTokens += record.totalTokens;
    if (typeof record.inputTokens === 'number') m.inputTokens += record.inputTokens;
    if (typeof record.outputTokens === 'number') m.outputTokens += record.outputTokens;
    if (typeof record.estimatedCost === 'number') m.estimatedCost += record.estimatedCost;
  }

  recordRetry(entityKey: string): void {
    const m = this.getOrCreateMetrics(entityKey);
    m.retryCount++;
  }

  recordFallback(entityKey: string): void {
    const m = this.getOrCreateMetrics(entityKey);
    m.fallbackCount++;
  }

  resetEntity(entityKey: string): void {
    this.metricsMap.delete(entityKey);
  }

  clear(): void {
    this.metricsMap.clear();
  }
}
