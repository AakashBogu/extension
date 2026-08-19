import { RecognitionResult } from './TranscriptTypes';

export class PartialTranscriptManager {
  private activePartial: RecognitionResult | null = null;

  updatePartial(result: RecognitionResult): void {
    if (!result.isFinal) {
      this.activePartial = result;
    }
  }

  clearPartial(): void {
    this.activePartial = null;
  }

  getActivePartial(): RecognitionResult | null {
    return this.activePartial;
  }
}
