import { ProviderError } from '../../error/ProviderErrors';

export class ProviderRetryManager {
  constructor(
    private maxAttempts: number = 3,
    private initialDelayMs: number = 500,
    private maxDelayMs: number = 5000
  ) {}

  shouldRetry(error: unknown, attemptCount: number): boolean {
    if (attemptCount >= this.maxAttempts) return false;
    if (error instanceof ProviderError) {
      return error.retryable;
    }
    return true;
  }

  async calculateBackoffAndDelay(attemptCount: number): Promise<void> {
    const delay = Math.min(this.maxDelayMs, this.initialDelayMs * Math.pow(2, attemptCount - 1));
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
