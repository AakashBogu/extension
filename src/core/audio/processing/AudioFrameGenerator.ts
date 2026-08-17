import { AudioFrame } from './AudioProcessingTypes';

export class AudioFrameGenerator {
  private buffer: Float32Array = new Float32Array(0);
  private sequenceNumber = 0;

  constructor(
    private frameDurationMs: number = 20,
    private sampleRate: number = 16000,
    private channels: number = 1
  ) {}

  get frameSize(): number {
    return Math.floor((this.sampleRate * this.frameDurationMs) / 1000);
  }

  pushSamples(samples: Float32Array): AudioFrame[] {
    if (!samples || samples.length === 0) return [];

    const newBuffer = new Float32Array(this.buffer.length + samples.length);
    newBuffer.set(this.buffer, 0);
    newBuffer.set(samples, this.buffer.length);
    this.buffer = newBuffer;

    const frames: AudioFrame[] = [];
    const size = this.frameSize;

    while (this.buffer.length >= size) {
      const frameSamples = this.buffer.slice(0, size);
      this.buffer = this.buffer.slice(size);

      this.sequenceNumber++;
      frames.push({
        id: `frm_${this.sequenceNumber}_${Date.now()}`,
        sequenceNumber: this.sequenceNumber,
        timestamp: Date.now(),
        durationMs: this.frameDurationMs,
        sampleRate: this.sampleRate,
        channels: this.channels,
        samples: frameSamples
      });
    }

    return frames;
  }

  flush(): AudioFrame | null {
    if (this.buffer.length === 0) return null;

    const frameSamples = this.buffer;
    this.buffer = new Float32Array(0);
    this.sequenceNumber++;

    return {
      id: `frm_${this.sequenceNumber}_${Date.now()}`,
      sequenceNumber: this.sequenceNumber,
      timestamp: Date.now(),
      durationMs: Math.round((frameSamples.length / this.sampleRate) * 1000),
      sampleRate: this.sampleRate,
      channels: this.channels,
      samples: frameSamples
    };
  }

  reset(): void {
    this.buffer = new Float32Array(0);
    this.sequenceNumber = 0;
  }
}
