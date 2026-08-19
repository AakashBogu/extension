import { ISearchProvider } from '../search/ISearchProvider';
import { IAIProvider } from '../ai/IAIProvider';
import { ProviderError } from '../../error/ProviderErrors';
import { IEventBus } from '../../events/IEventBus';

export class ProviderRecoveryManager {
  private recoveryAttempts = new Map<string, number>();

  constructor(
    private maxAttempts: number = 5,
    private initialDelayMs: number = 500,
    private maxDelayMs: number = 16000,
    private eventBus?: IEventBus
  ) {}

  async recover(provider: ISearchProvider | IAIProvider, reason: string): Promise<void> {
    const attempts = (this.recoveryAttempts.get(provider.id) || 0) + 1;
    if (attempts > this.maxAttempts) {
      if (this.eventBus) {
        this.eventBus.publish('provider.recovery_failed', { providerId: provider.id, attempts, reason, timestamp: Date.now() });
      }
      throw new ProviderError(`Provider [${provider.id}] recovery limit exceeded (${this.maxAttempts} attempts)`, 'ERR_PROVIDER_RECOVERY', { providerId: provider.id });
    }

    this.recoveryAttempts.set(provider.id, attempts);
    if (this.eventBus) {
      this.eventBus.publish('provider.recovery_started', { providerId: provider.id, attempt: attempts, reason, timestamp: Date.now() });
    }

    const delay = Math.min(this.maxDelayMs, this.initialDelayMs * Math.pow(2, attempts - 1));
    await new Promise(r => setTimeout(r, delay));

    try {
      provider.destroy();
      await provider.initialize();

      if (this.eventBus) {
        this.eventBus.publish('provider.recovery_completed', { providerId: provider.id, attempt: attempts, timestamp: Date.now() });
      }
    } catch (err) {
      if (this.eventBus) {
        this.eventBus.publish('provider.recovery_failed', { providerId: provider.id, attempt: attempts, error: String(err), timestamp: Date.now() });
      }
      throw new ProviderError(`Provider [${provider.id}] recovery failed: ${String(err)}`, 'ERR_PROVIDER_RECOVERY', { providerId: provider.id });
    }
  }

  reset(providerId: string): void {
    this.recoveryAttempts.delete(providerId);
  }

  clear(): void {
    this.recoveryAttempts.clear();
  }
}
