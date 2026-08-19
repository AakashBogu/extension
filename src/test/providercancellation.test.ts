import { describe, it, expect } from 'vitest';
import { ProviderRequestCancellationManager } from '../core/providers/execution/ProviderRequestCancellationManager';
import { ProviderRequestCancelledError } from '../core/error/ProviderExecutionErrors';

describe('Module 6D: ProviderRequestCancellationManager', () => {
  it('should create AbortController, cancel request, and throw ProviderRequestCancelledError', () => {
    const manager = new ProviderRequestCancellationManager();
    const controller = manager.createController('req_cancel_1');

    expect(controller.signal.aborted).toBe(false);

    const cancelled = manager.cancelRequest('req_cancel_1');
    expect(cancelled).toBe(true);
    expect(controller.signal.aborted).toBe(true);

    expect(() => manager.checkCancelled('req_cancel_1')).toThrow(ProviderRequestCancelledError);
  });
});
