import { IClaimAnalysisProvider } from './IClaimAnalysisProvider';
import { ClaimCandidate } from '../ClaimTypes';

export class NullClaimAnalysisProvider implements IClaimAnalysisProvider {
  public readonly id = 'null-claim-provider';
  public readonly name = 'NullClaimAnalysisProvider';
  private isInitialized = false;

  async initialize(): Promise<void> {
    this.isInitialized = true;
  }

  async analyzeText(_text: string): Promise<Partial<ClaimCandidate> | null> {
    return null; // Null provider lets local rule-based detectors run
  }

  async healthCheck(): Promise<{ ready: boolean; providerId: string }> {
    return { ready: this.isInitialized, providerId: this.id };
  }

  destroy(): void {
    this.isInitialized = false;
  }
}
