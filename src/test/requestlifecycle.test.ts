import { describe, it, expect } from 'vitest';
import { RequestLifecycleManager } from '../core/providers/execution/RequestLifecycleManager';
import { ProviderExecutionStateError } from '../core/error/ProviderExecutionErrors';
import { RequestLifecycleState } from '../core/providers/execution/ProviderExecutionTypes';

describe('Module 6D: RequestLifecycleManager', () => {
  it('should track request lifecycle transitions and reject invalid terminal state transitions', () => {
    const manager = new RequestLifecycleManager(10);
    const record = manager.createRecord('req_lifecycle_1', 'AI', 30000);

    expect(record.state).toBe('CREATED');

    manager.transitionTo('req_lifecycle_1', 'ROUTING');
    expect(manager.getRecord('req_lifecycle_1')?.state).toBe('ROUTING');

    manager.transitionTo('req_lifecycle_1', 'EXECUTING');
    expect(manager.getRecord('req_lifecycle_1')?.state).toBe('EXECUTING');

    manager.transitionTo('req_lifecycle_1', 'COMPLETED');
    expect(manager.getRecord('req_lifecycle_1')?.state).toBe('COMPLETED');

    expect(() => manager.transitionTo('req_lifecycle_1', 'QUEUED' as RequestLifecycleState)).toThrow(ProviderExecutionStateError);
  });
});
