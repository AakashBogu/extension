import { AudioChunk, AudioFrame } from './AudioProcessingTypes';

export class AudioChunkManager {
  private pendingFrames: AudioFrame[] = [];
  private chunkSequence = 0;

  constructor(
    private chunkDurationMs: number = 1000,
    private _maxPendingChunks: number = 10
  ) {}

  getMaxPendingChunks(): number {
    return this._maxPendingChunks;
  }

  addFrame(frame: AudioFrame): AudioChunk | null {
    this.pendingFrames.push(frame);

    const totalDuration = this.pendingFrames.reduce((acc, f) => acc + f.durationMs, 0);
    if (totalDuration >= this.chunkDurationMs) {
      return this.flushChunk();
    }

    return null;
  }

  flushChunk(): AudioChunk | null {
    if (this.pendingFrames.length === 0) return null;

    const totalSamples = this.pendingFrames.reduce((acc, f) => acc + f.samples.length, 0);
    const combined = new Float32Array(totalSamples);

    let offset = 0;
    this.pendingFrames.forEach(f => {
      combined.set(f.samples, offset);
      offset += f.samples.length;
    });

    const firstFrame = this.pendingFrames[0];
    const totalDurationMs = this.pendingFrames.reduce((acc, f) => acc + f.durationMs, 0);
    this.pendingFrames = [];
    this.chunkSequence++;

    return {
      id: `chk_${this.chunkSequence}_${Date.now()}`,
      sequenceNumber: this.chunkSequence,
      timestamp: firstFrame.timestamp,
      durationMs: totalDurationMs,
      sampleRate: firstFrame.sampleRate,
      channels: firstFrame.channels,
      samples: combined
    };
  }

  reset(): void {
    this.pendingFrames = [];
    this.chunkSequence = 0;
  }
}
