export class TranscriptTimestampNormalizer {
  normalizeTimestamp(timestamp: number, sessionStartTime: number): number {
    if (timestamp < sessionStartTime) return 0;
    return timestamp - sessionStartTime;
  }
}
