import { AudioProcessingMetrics } from './AudioProcessingTypes';

export class AudioProcessingRegistry {
  private metrics: AudioProcessingMetrics = {
    processedFrames: 0,
    processedChunks: 0,
    droppedFrames: 0,
    droppedChunks: 0,
    averageProcessingTimeMs: 0,
    maxProcessingTimeMs: 0,
    averageFrameLatencyMs: 0,
    currentBufferDepth: 0,
    speechSegmentsDetected: 0,
    totalSpeechDurationMs: 0
  };

  recordFrameProcessed(timeMs: number): void {
    this.metrics.processedFrames++;
    this.metrics.maxProcessingTimeMs = Math.max(this.metrics.maxProcessingTimeMs, timeMs);
    this.metrics.averageProcessingTimeMs =
      (this.metrics.averageProcessingTimeMs * (this.metrics.processedFrames - 1) + timeMs) /
      this.metrics.processedFrames;
  }

  recordChunkProcessed(): void {
    this.metrics.processedChunks++;
  }

  recordDroppedFrame(): void {
    this.metrics.droppedFrames++;
  }

  recordDroppedChunk(): void {
    this.metrics.droppedChunks++;
  }

  recordSpeechSegment(durationMs: number): void {
    this.metrics.speechSegmentsDetected++;
    this.metrics.totalSpeechDurationMs += durationMs;
  }

  getMetrics(): AudioProcessingMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      processedFrames: 0,
      processedChunks: 0,
      droppedFrames: 0,
      droppedChunks: 0,
      averageProcessingTimeMs: 0,
      maxProcessingTimeMs: 0,
      averageFrameLatencyMs: 0,
      currentBufferDepth: 0,
      speechSegmentsDetected: 0,
      totalSpeechDurationMs: 0
    };
  }
}
