import { AudioChunk } from '../processing/AudioProcessingTypes';
import { BackpressureDropStrategy, QueueMetrics } from './AudioTransportTypes';
import { AudioQueueFullError } from '../../error/AudioTransportErrors';

export class AudioChunkQueue {
  private queue: AudioChunk[] = [];
  private droppedChunks = 0;
  private rejectedChunks = 0;

  constructor(
    private maxCapacity: number = 10,
    private dropStrategy: BackpressureDropStrategy = 'DROP_OLDEST'
  ) {}

  enqueue(chunk: AudioChunk): boolean {
    if (this.isFull()) {
      if (this.dropStrategy === 'REJECT') {
        this.rejectedChunks++;
        throw new AudioQueueFullError(this.queue.length, this.maxCapacity);
      }

      if (this.dropStrategy === 'DROP_OLDEST') {
        this.queue.shift(); // Drop head
        this.droppedChunks++;
      } else if (this.dropStrategy === 'DROP_NEWEST') {
        this.droppedChunks++;
        return false; // Reject incoming chunk
      }
    }

    this.queue.push(chunk);
    return true;
  }

  dequeue(): AudioChunk | undefined {
    return this.queue.shift();
  }

  peek(): AudioChunk | undefined {
    return this.queue[0];
  }

  clear(): void {
    this.queue = [];
  }

  size(): number {
    return this.queue.length;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  isFull(): boolean {
    return this.queue.length >= this.maxCapacity;
  }

  getMetrics(): QueueMetrics {
    const size = this.size();
    return {
      size,
      capacity: this.maxCapacity,
      utilizationPercent: (size / this.maxCapacity) * 100,
      droppedChunks: this.droppedChunks,
      rejectedChunks: this.rejectedChunks,
      averageLatencyMs: 0
    };
  }

  destroy(): void {
    this.clear();
  }
}
