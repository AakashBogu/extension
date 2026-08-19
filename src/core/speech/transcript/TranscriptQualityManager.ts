import { TranscriptSegmentRecord } from './TranscriptTypes';

export class TranscriptQualityManager {
  evaluateSegmentQuality(segment: TranscriptSegmentRecord): { isHighQuality: boolean; flags: string[] } {
    const flags: string[] = [];

    if (segment.confidence < 0.5) flags.push('LOW_CONFIDENCE');
    if (!segment.text || segment.text.trim().length === 0) flags.push('EMPTY_TEXT');
    if (segment.endTime <= segment.startTime) flags.push('INVALID_TIMESTAMPS');

    return {
      isHighQuality: flags.length === 0,
      flags
    };
  }
}
