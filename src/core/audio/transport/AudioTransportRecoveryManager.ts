import { ISpeechPipelineAdapter } from './AudioTransportTypes';
import { AudioTransportRecoveryError } from '../../error/AudioTransportErrors';
import { IEventBus } from '../../events/IEventBus';

export class AudioTransportRecoveryManager {
  private recoveryCount = 0;
  private maxAttempts: number;
  private backoffMs: number;

  constructor(
    private adapter: ISpeechPipelineAdapter,
    maxAttempts: number = 5,
    backoffMs: number = 500,
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
      if (this.eventBus) this.eventBus.publish('audio.transport_recovery_failed', { attempts: this.recoveryCount, reason });
      throw new AudioTransportRecoveryError(this.recoveryCount, reason);
    }

    this.recoveryCount++;
    if (this.eventBus) this.eventBus.publish('audio.transport_recovery_started', { attempt: this.recoveryCount, reason });

    const delay = this.backoffMs * Math.pow(2, this.recoveryCount - 1);
    await new Promise(res => setTimeout(res, delay));

    try {
      await this.adapter.stop();
      await this.adapter.initialize();
      await this.adapter.resume();

      if (this.eventBus) this.eventBus.publish('audio.transport_recovery_completed', { attempt: this.recoveryCount });
    } catch (err) {
      if (this.eventBus) this.eventBus.publish('audio.transport_recovery_failed', { attempt: this.recoveryCount, error: String(err) });
      throw new AudioTransportRecoveryError(this.recoveryCount, err instanceof Error ? err.message : String(err));
    }
  }

  reset(): void {
    this.recoveryCount = 0;
  }
}
