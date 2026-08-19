import { ClaimVerifiabilityLevel } from '../ClaimTypes';

export class ClaimConfidenceScorer {
  computeConfidence(signalsCount: number, verifiability: ClaimVerifiabilityLevel): number {
    let score = 0.5;

    if (signalsCount >= 3) score += 0.3;
    else if (signalsCount >= 1) score += 0.2;

    if (verifiability === 'HIGH') score += 0.15;
    else if (verifiability === 'MEDIUM') score += 0.05;

    return Math.min(1.0, Math.max(0.0, score));
  }
}
