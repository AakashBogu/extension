import { TabCaptureSessionRecord, TabCaptureStatus } from './TabAudioCaptureTypes';
import { TabCaptureSessionError, TabCaptureValidationError } from '../../error/TabCaptureErrors';

export class TabCaptureSessionManager {
  private sessions = new Map<string, TabCaptureSessionRecord>();
  private activeSessionId: string | null = null;

  createSession(tabId: number, source: string = 'active-tab'): TabCaptureSessionRecord {
    if (tabId <= 0) throw new TabCaptureValidationError('TabId', 'Invalid tab ID');

    const sessionId = `cap_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const correlationId = `corr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const record: TabCaptureSessionRecord = {
      sessionId,
      tabId,
      createdAt: Date.now(),
      startedAt: 0,
      status: 'IDLE',
      audioTrackCount: 0,
      source,
      correlationId
    };

    this.sessions.set(sessionId, record);
    this.activeSessionId = sessionId;
    return record;
  }

  updateSessionStatus(sessionId: string, status: TabCaptureStatus, details?: Partial<TabCaptureSessionRecord>): TabCaptureSessionRecord {
    const session = this.sessions.get(sessionId);
    if (!session) throw new TabCaptureSessionError(sessionId, 'Session not found');

    session.status = status;
    if (status === 'STARTING' && session.startedAt === 0) {
      session.startedAt = Date.now();
    } else if (status === 'STOPPED' || status === 'DESTROYED') {
      session.stoppedAt = Date.now();
    }

    if (details) {
      Object.assign(session, details);
    }

    return session;
  }

  getActiveSession(): TabCaptureSessionRecord | undefined {
    if (this.activeSessionId) {
      return this.sessions.get(this.activeSessionId);
    }
    return undefined;
  }

  closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'STOPPED';
      session.stoppedAt = Date.now();
    }
    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
    }
  }

  clear(): void {
    this.sessions.clear();
    this.activeSessionId = null;
  }
}
