import { describe, it, expect } from 'vitest';
import { RecognitionSessionManager } from '../core/speech/session/RecognitionSessionManager';

describe('Module 4: RecognitionSessionManager', () => {
  it('should manage recognition session creation and lifecycle transitions', () => {
    const manager = new RecognitionSessionManager();
    const session = manager.createSession(101, 'null-provider', 'en-US');

    expect(session.status).toBe('IDLE');
    manager.updateSessionStatus(session.sessionId, 'ACTIVE');

    expect(manager.getActiveSession()?.status).toBe('ACTIVE');

    manager.closeSession(session.sessionId);
    expect(manager.getActiveSession()).toBeUndefined();
  });
});
