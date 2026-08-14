import { OffscreenDocumentManager } from './OffscreenDocumentManager';
import { AudioContextRuntime } from './AudioContextRuntime';
import { OffscreenRecoveryError } from '../error/OffscreenRuntimeErrors';
import { IEventBus } from '../events/IEventBus';

export class OffscreenRecoveryManager {
  private recoveryCount = 0;
  private maxAttempts: number;
  private backoffMs: number;

  constructor(
    private docManager: OffscreenDocumentManager,
    private audioRuntime: AudioContextRuntime,
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

  async recover(reason: string): Promise<void> {
    if (this.recoveryCount >= this.maxAttempts) {
      if (this.eventBus) this.eventBus.publish('offscreen.recovery_failed', { attempts: this.recoveryCount, reason });
      throw new OffscreenRecoveryError(this.recoveryCount, reason);
    }

    this.recoveryCount++;
    if (this.eventBus) this.eventBus.publish('offscreen.recovery_started', { attempt: this.recoveryCount, reason });

    const delay = this.backoffMs * Math.pow(2, this.recoveryCount - 1);
    await new Promise(res => setTimeout(res, delay));

    try {
      await this.audioRuntime.close();
      if (await this.docManager.hasDocument()) {
        await this.docManager.closeDocument();
      }

      await this.docManager.createDocument();
      this.audioRuntime.initialize();

      if (this.eventBus) this.eventBus.publish('offscreen.recovery_completed', { attempt: this.recoveryCount });
    } catch (err) {
      if (this.eventBus) this.eventBus.publish('offscreen.recovery_failed', { attempt: this.recoveryCount, error: String(err) });
      throw new OffscreenRecoveryError(this.recoveryCount, err instanceof Error ? err.message : String(err));
    }
  }

  reset(): void {
    this.recoveryCount = 0;
  }
}
