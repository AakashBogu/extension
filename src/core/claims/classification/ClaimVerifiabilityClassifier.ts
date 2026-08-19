import { ClaimVerifiabilityLevel, ClaimTypeCategory } from '../ClaimTypes';

export class ClaimVerifiabilityClassifier {
  classifyVerifiability(categories: ClaimTypeCategory[], text: string): ClaimVerifiabilityLevel {
    if (categories.includes('QUESTION') || categories.includes('COMMAND') || categories.includes('OPINION')) {
      return 'NOT_VERIFIABLE';
    }

    if (categories.includes('NUMERICAL') || categories.includes('ATTRIBUTED') || /\b(population|gdp|inflation|percent|%|atomic number)\b/i.test(text)) {
      return 'HIGH';
    }

    if (categories.includes('TEMPORAL') || categories.includes('COMPARATIVE')) {
      return 'MEDIUM';
    }

    return 'LOW';
  }
}
