export class SpeechRecognitionMetricsCollector {
  private metrics = {
    sessionsStarted: 0,
    sessionsCompleted: 0,
    sessionsFailed: 0,
    audioChunksProcessed: 0,
    recognitionResultsReceived: 0,
    partialResultsReceived: 0,
    finalResultsReceived: 0,
    duplicateResults: 0,
    outOfOrderResults: 0,
    averageConfidence: 1.0,
    providerFailures: 0,
    providerSwitches: 0,
    recoveryAttempts: 0
  };

  recordChunkProcessed(): void { this.metrics.audioChunksProcessed++; }
  recordResultReceived(isFinal: boolean, confidence: number): void {
    this.metrics.recognitionResultsReceived++;
    if (isFinal) {
      this.metrics.finalResultsReceived++;
      this.metrics.averageConfidence = (this.metrics.averageConfidence + confidence) / 2;
    } else {
      this.metrics.partialResultsReceived++;
    }
  }
  recordDuplicate(): void { this.metrics.duplicateResults++; }

  getMetrics() {
    return { ...this.metrics };
  }
}
