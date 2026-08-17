import { SpeechSegment } from './AudioProcessingTypes';

export class SpeechSegmentManager {
  private currentSegment: SpeechSegment | null = null;
  private segmentCounter = 0;

  startSegment(sequenceNumber: number, confidence: number): SpeechSegment {
    if (this.currentSegment) {
      this.finalizeSegment(sequenceNumber);
    }

    this.segmentCounter++;
    this.currentSegment = {
      id: `seg_${this.segmentCounter}_${Date.now()}`,
      startTime: Date.now(),
      frameCount: 1,
      confidence,
      sequenceStart: sequenceNumber
    };

    return this.currentSegment;
  }

  appendFrame(): void {
    if (this.currentSegment) {
      this.currentSegment.frameCount++;
    }
  }

  finalizeSegment(sequenceNumber: number): SpeechSegment | null {
    if (!this.currentSegment) return null;

    const seg = this.currentSegment;
    seg.endTime = Date.now();
    seg.durationMs = seg.endTime - seg.startTime;
    seg.sequenceEnd = sequenceNumber;
    this.currentSegment = null;

    return seg;
  }

  getCurrentSegment(): SpeechSegment | null {
    return this.currentSegment;
  }

  reset(): void {
    this.currentSegment = null;
  }
}
