export interface EntityExtractionResult {
  entities: Array<{
    entityId: string;
    text: string;
    type: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'COUNTRY' | 'CITY' | 'PRODUCT' | 'EVENT' | 'DATE' | 'TIME' | 'NUMBER' | 'PERCENTAGE' | 'CURRENCY' | 'UNKNOWN';
    startOffset: number;
    endOffset: number;
    confidence: number;
  }>;
}
