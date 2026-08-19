import { SpeechProviderRouter } from '../provider/SpeechProviderRouter';
import { SpeechRecognitionRecoveryError } from '../errors/SpeechRecognitionErrors';
import { IEventBus } from '../../events/IEventBus';

export class SpeechRecognitionRecoveryManager {
  private recoveryCount = 0;

  constructor(
    private router: SpeechProviderRouter,
    private maxAttempts: number = 3,
    private backoffMs: number = 500,
    private eventBus?: IEventBus
  ) {}

  getRecoveryCount(): number {
    return this.recoveryCount;
  }

  async recover(failedProviderId: string, reason: string): Promise<void> {
    if (this.recoveryCount >= this.maxAttempts) {
      if (this.eventBus) this.eventBus.publish('speech.recognition_recovery_failed', { failedProviderId, attempts: this.recoveryCount, reason });
      throw new SpeechRecognitionRecoveryError(this.recoveryCount, reason);
    }

    this.recoveryCount++;
    if (this.eventBus) this.eventBus.publish('speech.recognition_recovery_started', { attempt: this.recoveryCount, reason });

    const delay = this.backoffMs * Math.pow(2, this.recoveryCount - 1);
    await new Promise(res => setTimeout(res, delay));

    // Fallback router selection
    try {
      const fallbackProvider = this.router.selectProvider(undefined);
      if (this.eventBus) {
        this.eventBus.publish('speech.provider_switched', { oldProvider: failedProviderId, newProvider: fallbackProvider.id });
        this.eventBus.publish('speech.recognition_recovery_completed', { attempt: this.recoveryCount });
      }
    } catch (err) {
      if (this.eventBus) this.eventBus.publish('speech.recognition_recovery_failed', { attempt: this.recoveryCount, error: String(err) });
      throw new SpeechRecognitionRecoveryError(this.recoveryCount, String(err));
    }
  }

  reset(): void {
    this.recoveryCount = 0;
  }
}
