import { TabCaptureSessionManager } from './TabCaptureSessionManager';
import { TabCaptureRecoveryError } from '../../error/TabCaptureErrors';
import { IEventBus } from '../../events/IEventBus';

export class TabCaptureRecoveryManager {
  private recoveryCount = 0;
  private maxAttempts: number;
  private backoffMs: number;

  constructor(
    private sessionManager: TabCaptureSessionManager,
    maxAttempts: number = 5,
    backoffMs: number = 1000,
    private eventBus?: IEventBus
  ) {
    this.maxAttempts = maxAttempts;
    this.backoffMs = backoffMs;
  }

  getRecoveryCount(): number {
    return this.recoveryCount;
  }

  async recoverSession(sessionId: string, reason: string): Promise<void> {
    if (this.recoveryCount >= this.maxAttempts) {
      if (this.eventBus) this.eventBus.publish('audio.capture_recovery_failed', { sessionId, attempts: this.recoveryCount, reason });
      throw new TabCaptureRecoveryError(this.recoveryCount, reason);
    }

    this.recoveryCount++;
    if (this.eventBus) this.eventBus.publish('audio.capture_recovery_started', { sessionId, attempt: this.recoveryCount, reason });

    const delay = this.backoffMs * Math.pow(2, this.recoveryCount - 1);
    await new Promise(res => setTimeout(res, delay));

    this.sessionManager.updateSessionStatus(sessionId, 'RECOVERING');
    if (this.eventBus) this.eventBus.publish('audio.capture_recovery_completed', { sessionId, attempt: this.recoveryCount });
  }

  reset(): void {
    this.recoveryCount = 0;
  }
}
