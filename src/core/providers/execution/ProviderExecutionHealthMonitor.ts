import { ProviderExecutionHealth } from './ProviderExecutionTypes';
import { ProviderExecutionMetricsCollector } from './ProviderExecutionMetricsCollector';
import { ProviderHealthManager } from '../health/ProviderHealthManager';
import { IEventBus } from '../../events/IEventBus';

export class ProviderExecutionHealthMonitor {
  constructor(
    _healthManager: ProviderHealthManager,
    private metricsCollector: ProviderExecutionMetricsCollector,
    private eventBus?: IEventBus
  ) {}

  checkHealth(): ProviderExecutionHealth {
    const metrics = this.metricsCollector.getMetrics();
    const totalFinished = metrics.successfulRequests + metrics.failedRequests;
    const failureRate = totalFinished > 0 ? metrics.failedRequests / totalFinished : 0;

    let status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' = 'HEALTHY';

    if (failureRate >= 0.5 || metrics.timedOutRequests > 5) {
      status = 'UNHEALTHY';
    } else if (failureRate > 0.1 || metrics.retryAttempts > 5) {
      status = 'DEGRADED';
    }

    if (this.eventBus) {
      this.eventBus.publish('provider.execution_health_changed', { status, failureRate, timestamp: Date.now() });
    }

    return {
      status,
      activeRequests: metrics.activeRequests,
      failureRate,
      lastCheckedAt: Date.now()
    };
  }
}
