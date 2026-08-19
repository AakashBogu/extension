import { ClaimDetectionRecoveryError } from '../errors/ClaimDetectionErrors';

export class ClaimDetectionRecoveryManager {
  private attempts = 0;

  async recover(reason: string): Promise<void> {
    if (this.attempts >= 3) {
      throw new ClaimDetectionRecoveryError(this.attempts, reason);
    }
    this.attempts++;
    await new Promise(r => setTimeout(r, 10));
  }

  reset(): void {
    this.attempts = 0;
  }
}
