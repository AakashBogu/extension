import { describe, it, expect } from 'vitest';
import { TabCaptureRecoveryManager } from '../core/audio/capture/TabCaptureRecoveryManager';
import { TabCaptureSessionManager } from '../core/audio/capture/TabCaptureSessionManager';
import { EventBus } from '../core/events/EventBus';

describe('Module 3B: TabCaptureRecoveryManager', () => {
  it('should manage exponential backoff recovery and enforce attempt limits', async () => {
    const eventBus = new EventBus();
    const sessionManager = new TabCaptureSessionManager();
    const session = sessionManager.createSession(99);

    const recoveryManager = new TabCaptureRecoveryManager(sessionManager, 2, 10, eventBus);

    await recoveryManager.recoverSession(session.sessionId, 'Track ended unexpectedly');
    expect(recoveryManager.getRecoveryCount()).toBe(1);

    await recoveryManager.recoverSession(session.sessionId, 'Stream disconnect');
    expect(recoveryManager.getRecoveryCount()).toBe(2);

    await expect(recoveryManager.recoverSession(session.sessionId, 'Third crash')).rejects.toThrow();
  });
});
