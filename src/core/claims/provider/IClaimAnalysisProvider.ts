import { ClaimCandidate } from '../ClaimTypes';

export interface IClaimAnalysisProvider {
  readonly id: string;
  readonly name: string;

  initialize(): Promise<void>;
  analyzeText(text: string): Promise<Partial<ClaimCandidate> | null>;
  healthCheck(): Promise<{ ready: boolean; providerId: string }>;
  destroy(): void;
}
