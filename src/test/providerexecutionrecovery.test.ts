import { describe, it, expect } from 'vitest';
import { ProviderExecutionRecoveryManager } from '../core/providers/execution/ProviderExecutionRecoveryManager';
import { RequestLifecycleManager } from '../core/providers/execution/RequestLifecycleManager';
import { ProviderRequestCancellationManager } from '../core/providers/execution/ProviderRequestCancellationManager';
import { ProviderExecutionMetricsCollector } from '../core/providers/execution/ProviderExecutionMetricsCollector';

describe('Module 6D: ProviderExecutionRecoveryManager', () => {
  it('should clean active records and cancel controllers on recovery reset', async () => {
    const lifecycle = new RequestLifecycleManager();
    const cancellation = new ProviderRequestCancellationManager();
    const metrics = new ProviderExecutionMetricsCollector();

    lifecycle.createRecord('req_rec_1', 'AI', 30000);
    lifecycle.transitionTo('req_rec_1', 'EXECUTING');
    cancellation.createController('req_rec_1');

    const recovery = new ProviderExecutionRecoveryManager(lifecycle, cancellation, metrics);
    await recovery.recoverSubsystem('Test reset');

    expect(lifecycle.getRecord('req_rec_1')?.state).toBe('FAILED');
  });
});
