import { RecognitionSessionRecord, RecognitionSessionStatus } from './RecognitionSessionTypes';
import { RecognitionSessionError } from '../errors/SpeechRecognitionErrors';

export class RecognitionSessionManager {
  private sessions = new Map<string, RecognitionSessionRecord>();
  private activeSessionId: string | null = null;

  createSession(tabId: number, providerId: string, language: string = 'en-US', videoId?: string): RecognitionSessionRecord {
    const sessionId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const correlationId = `corr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const record: RecognitionSessionRecord = {
      sessionId,
      tabId,
      videoId,
      createdAt: Date.now(),
      startedAt: 0,
      status: 'IDLE',
      providerId,
      language,
      correlationId
    };

    this.sessions.set(sessionId, record);
    this.activeSessionId = sessionId;
    return record;
  }

  updateSessionStatus(sessionId: string, status: RecognitionSessionStatus): RecognitionSessionRecord {
    const session = this.sessions.get(sessionId);
    if (!session) throw new RecognitionSessionError(sessionId, 'Session not found');

    session.status = status;
    if (status === 'ACTIVE' && session.startedAt === 0) {
      session.startedAt = Date.now();
    } else if (status === 'STOPPED') {
      session.stoppedAt = Date.now();
    }

    return session;
  }

  getActiveSession(): RecognitionSessionRecord | undefined {
    return this.activeSessionId ? this.sessions.get(this.activeSessionId) : undefined;
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
