import { RecognitionResult } from './TranscriptTypes';

export class TranscriptDeduplicationManager {
  private seenIds = new Set<string>();

  isDuplicate(result: RecognitionResult): boolean {
    if (this.seenIds.has(result.id)) return true;
    this.seenIds.add(result.id);
    return false;
  }

  reset(): void {
    this.seenIds.clear();
  }
}
