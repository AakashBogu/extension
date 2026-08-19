import { ClaimEntity } from '../ClaimTypes';

export class ClaimEntityExtractor {
  extractEntities(text: string): ClaimEntity[] {
    const entities: ClaimEntity[] = [];

    // Match percentages first (\d+%), then standalone numbers
    const matches = Array.from(text.matchAll(/(\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?|\b\d+(?:\.\d+)?\b)/g));
    matches.forEach((m, idx) => {
      const matchText = m[1];
      const isPercent = matchText.endsWith('%');
      const isCurrency = matchText.startsWith('$');

      entities.push({
        entityId: `ent_${idx}_${m.index}`,
        text: matchText,
        type: isPercent ? 'PERCENTAGE' : isCurrency ? 'CURRENCY' : 'NUMBER',
        startOffset: m.index || 0,
        endOffset: (m.index || 0) + matchText.length,
        confidence: 0.95
      });
    });

    return entities;
  }
}
