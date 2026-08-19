import { ClaimPriorityLevel, ClaimVerifiabilityLevel } from '../ClaimTypes';

export class ClaimPriorityEngine {
  computePriority(verifiability: ClaimVerifiabilityLevel, confidence: number): ClaimPriorityLevel {
    if (verifiability === 'HIGH' && confidence >= 0.8) return 'CRITICAL';
    if (verifiability === 'HIGH' || confidence >= 0.7) return 'HIGH';
    if (verifiability === 'MEDIUM' || confidence >= 0.5) return 'MEDIUM';
    return 'LOW';
  }
}
