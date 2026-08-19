import { RequestLifecycleManager } from './RequestLifecycleManager';
import { ProviderRequestCancellationManager } from './ProviderRequestCancellationManager';
import { ProviderExecutionMetricsCollector } from './ProviderExecutionMetricsCollector';
import { IEventBus } from '../../events/IEventBus';

export class ProviderExecutionRecoveryManager {
  constructor(
    private lifecycleManager: RequestLifecycleManager,
    private cancellationManager: ProviderRequestCancellationManager,
    _metricsCollector: ProviderExecutionMetricsCollector,
    private eventBus?: IEventBus
  ) {}

  async recoverSubsystem(reason: string): Promise<void> {
    if (this.eventBus) {
      this.eventBus.publish('provider.execution_recovery_started', { reason, timestamp: Date.now() });
    }

    try {
      const activeRecords = this.lifecycleManager.getActiveRecords();
      activeRecords.forEach(r => {
        this.cancellationManager.cancelRequest(r.requestId);
        this.lifecycleManager.transitionTo(r.requestId, 'FAILED', { error: 'Subsystem recovery reset' });
      });

      this.cancellationManager.clear();
      if (this.eventBus) {
        this.eventBus.publish('provider.execution_recovery_completed', { timestamp: Date.now() });
      }
    } catch (err) {
      if (this.eventBus) {
        this.eventBus.publish('provider.execution_recovery_failed', { error: String(err), timestamp: Date.now() });
      }
      throw err;
    }
  }
}
