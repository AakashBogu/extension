import { describe, it, expect } from 'vitest';
import { TabCaptureSessionManager } from '../core/audio/capture/TabCaptureSessionManager';
import { TabCaptureValidationError } from '../core/error/TabCaptureErrors';

describe('Module 3B: TabCaptureSessionManager', () => {
  it('should validate tab ID and manage session state transitions', () => {
    const manager = new TabCaptureSessionManager();
    expect(() => manager.createSession(0)).toThrow(TabCaptureValidationError);

    const session = manager.createSession(55);
    expect(session.tabId).toBe(55);
    expect(session.status).toBe('IDLE');

    manager.updateSessionStatus(session.sessionId, 'ACTIVE');
    expect(manager.getActiveSession()?.status).toBe('ACTIVE');

    manager.closeSession(session.sessionId);
    expect(manager.getActiveSession()).toBeUndefined();
  });
});
