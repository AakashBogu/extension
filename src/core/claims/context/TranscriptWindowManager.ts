import { TranscriptSegmentRecord } from '../../speech/transcript/TranscriptTypes';

export class TranscriptWindowManager {
  private segments: TranscriptSegmentRecord[] = [];

  constructor(private maxSegments: number = 20) {}

  addSegment(segment: TranscriptSegmentRecord): void {
    this.segments.push(segment);
    if (this.segments.length > this.maxSegments) {
      this.segments.shift();
    }
  }

  getWindowText(): string {
    return this.segments.map(s => s.text).join(' ');
  }

  clear(): void {
    this.segments = [];
  }
}
