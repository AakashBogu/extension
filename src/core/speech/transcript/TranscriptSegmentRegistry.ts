import { TranscriptSegmentRecord } from './TranscriptTypes';

export class TranscriptSegmentRegistry {
  private segments: TranscriptSegmentRecord[] = [];

  addSegment(segment: TranscriptSegmentRecord): void {
    // Prevent duplicate sequence numbers
    const existingIndex = this.segments.findIndex(s => s.segmentId === segment.segmentId || s.sequenceNumber === segment.sequenceNumber);
    if (existingIndex >= 0) {
      this.segments[existingIndex] = segment;
    } else {
      this.segments.push(segment);
    }
    this.segments.sort((a, b) => a.startTime - b.startTime);
  }

  getSegments(): TranscriptSegmentRecord[] {
    return [...this.segments];
  }

  clear(): void {
    this.segments = [];
  }
}
