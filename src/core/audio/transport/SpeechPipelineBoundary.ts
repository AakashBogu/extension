import { ISpeechPipelineAdapter, SpeechPipelineHealth } from './AudioTransportTypes';
import { AudioChunk, SpeechSegment } from '../processing/AudioProcessingTypes';

export class NullSpeechPipelineAdapter implements ISpeechPipelineAdapter {
  public readonly name = 'NullSpeechPipelineAdapter';
  private processedChunks = 0;
  private lastProcessedAt = 0;
  private isInitialized = false;
  private isRunning = false;

  async initialize(): Promise<void> {
    this.isInitialized = true;
  }

  async acceptAudioChunk(chunk: AudioChunk): Promise<void> {
    if (!chunk) return;
    this.processedChunks++;
    this.lastProcessedAt = Date.now();
  }

  async acceptSpeechSegment(_segment: SpeechSegment): Promise<void> {
    // Null adapter accepts segment
  }

  async flush(): Promise<void> {}
  async pause(): Promise<void> { this.isRunning = false; }
  async resume(): Promise<void> { this.isRunning = true; }
  async stop(): Promise<void> { this.isRunning = false; }

  async healthCheck(): Promise<SpeechPipelineHealth> {
    return {
      ready: this.isInitialized && this.isRunning !== undefined,
      adapterName: this.name,
      processedChunksCount: this.processedChunks,
      lastProcessedAt: this.lastProcessedAt
    };
  }

  destroy(): void {
    this.isInitialized = false;
    this.isRunning = false;
  }
}

export class SpeechPipelineBoundary implements ISpeechPipelineAdapter {
  public readonly name: string;

  constructor(
    private targetAdapter: ISpeechPipelineAdapter = new NullSpeechPipelineAdapter()
  ) {
    this.name = targetAdapter.name;
  }

  async initialize(): Promise<void> {
    await this.targetAdapter.initialize();
  }

  async acceptAudioChunk(chunk: AudioChunk): Promise<void> {
    await this.targetAdapter.acceptAudioChunk(chunk);
  }

  async acceptSpeechSegment(segment: SpeechSegment): Promise<void> {
    await this.targetAdapter.acceptSpeechSegment(segment);
  }

  async flush(): Promise<void> {
    await this.targetAdapter.flush();
  }

  async pause(): Promise<void> {
    await this.targetAdapter.pause();
  }

  async resume(): Promise<void> {
    await this.targetAdapter.resume();
  }

  async stop(): Promise<void> {
    await this.targetAdapter.stop();
  }

  async healthCheck(): Promise<SpeechPipelineHealth> {
    return this.targetAdapter.healthCheck();
  }

  destroy(): void {
    this.targetAdapter.destroy();
  }
}
