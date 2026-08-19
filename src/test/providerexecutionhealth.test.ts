import { describe, it, expect } from 'vitest';
import { ProviderExecutionHealthMonitor } from '../core/providers/execution/ProviderExecutionHealthMonitor';
import { ProviderExecutionMetricsCollector } from '../core/providers/execution/ProviderExecutionMetricsCollector';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';

describe('Module 6D: ProviderExecutionHealthMonitor', () => {
  it('should compute health metrics based on failure rates', () => {
    const healthManager = new ProviderHealthManager();
    const metricsCollector = new ProviderExecutionMetricsCollector();
    const monitor = new ProviderExecutionHealthMonitor(healthManager, metricsCollector);

    metricsCollector.recordRequestCreated();
    metricsCollector.recordSuccess(20);

    const health = monitor.checkHealth();
    expect(health.status).toBe('HEALTHY');

    metricsCollector.recordRequestCreated();
    metricsCollector.recordFailure();
    metricsCollector.recordRequestCreated();
    metricsCollector.recordFailure();

    const degradedHealth = monitor.checkHealth();
    expect(degradedHealth.status).toBe('UNHEALTHY');
  });
});
