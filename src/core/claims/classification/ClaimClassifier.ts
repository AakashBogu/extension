import { ClaimTypeCategory } from '../ClaimTypes';

export class ClaimClassifier {
  classify(_text: string, signals: string[]): ClaimTypeCategory[] {
    const categories: ClaimTypeCategory[] = [];

    if (signals.includes('NUMERICAL')) categories.push('NUMERICAL');
    if (signals.includes('TEMPORAL')) categories.push('TEMPORAL');
    if (signals.includes('CAUSAL')) categories.push('CAUSAL');
    if (signals.includes('COMPARATIVE')) categories.push('COMPARATIVE');
    if (signals.includes('ATTRIBUTION')) categories.push('ATTRIBUTED');

    if (categories.length === 0) categories.push('FACTUAL');

    return categories;
  }
}
