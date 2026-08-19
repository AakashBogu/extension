import { PartialTranscriptManager } from './PartialTranscriptManager';
import { TranscriptSegmentRegistry } from './TranscriptSegmentRegistry';
import { TranscriptDeduplicationManager } from './TranscriptDeduplicationManager';
import { TranscriptTimestampNormalizer } from './TranscriptTimestampNormalizer';
import { TranscriptQualityManager } from './TranscriptQualityManager';
import { RecognitionResult, TranscriptSegmentRecord, FinalizedTranscript } from './TranscriptTypes';

export class TranscriptAggregator {
  public readonly partialManager = new PartialTranscriptManager();
  public readonly registry = new TranscriptSegmentRegistry();
  public readonly deduplicator = new TranscriptDeduplicationManager();
  public readonly normalizer = new TranscriptTimestampNormalizer();
  public readonly qualityManager = new TranscriptQualityManager();

  processResult(result: RecognitionResult): TranscriptSegmentRecord | null {
    if (this.deduplicator.isDuplicate(result)) return null;

    if (!result.isFinal) {
      this.partialManager.updatePartial(result);
      return null;
    }

    this.partialManager.clearPartial();

    const segment: TranscriptSegmentRecord = {
      segmentId: result.id,
      sessionId: result.sessionId,
      text: result.text,
      startTime: result.startTime,
      endTime: result.endTime,
      confidence: result.confidence,
      language: result.language,
      providerId: result.providerId,
      sequenceNumber: result.sequenceNumber,
      createdAt: result.timestamp,
      isFinal: true,
      words: result.words,
      speaker: result.speaker
    };

    this.registry.addSegment(segment);
    return segment;
  }

  buildFinalizedTranscript(sessionId: string, providerId: string, language: string, videoId?: string): FinalizedTranscript {
    const segments = this.registry.getSegments();
    const fullText = segments.map(s => s.text).join(' ');
    const startTime = segments.length > 0 ? segments[0].startTime : Date.now();
    const endTime = segments.length > 0 ? segments[segments.length - 1].endTime : Date.now();

    const totalConf = segments.reduce((acc, s) => acc + s.confidence, 0);
    const averageConfidence = segments.length > 0 ? totalConf / segments.length : 1.0;

    return {
      transcriptId: `tr_${sessionId}_${Date.now()}`,
      sessionId,
      videoId,
      language,
      segments,
      fullText,
      startTime,
      endTime,
      averageConfidence,
      providerId,
      createdAt: Date.now()
    };
  }

  reset(): void {
    this.partialManager.clearPartial();
    this.registry.clear();
    this.deduplicator.reset();
  }
}
