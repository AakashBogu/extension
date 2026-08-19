import { describe, it, expect } from 'vitest';
import { AudioChunkQueue } from '../core/audio/transport/AudioChunkQueue';
import { AudioQueueFullError } from '../core/error/AudioTransportErrors';
import { AudioChunk } from '../core/audio/processing/AudioProcessingTypes';

describe('Module 3D: AudioChunkQueue', () => {
  it('should enforce FIFO queue behavior and bounded capacity with DROP_OLDEST strategy', () => {
    const queue = new AudioChunkQueue(2, 'DROP_OLDEST');

    const c1: AudioChunk = { id: 'c1', sequenceNumber: 1, timestamp: 100, durationMs: 1000, sampleRate: 16000, channels: 1, samples: new Float32Array(10) };
    const c2: AudioChunk = { id: 'c2', sequenceNumber: 2, timestamp: 200, durationMs: 1000, sampleRate: 16000, channels: 1, samples: new Float32Array(10) };
    const c3: AudioChunk = { id: 'c3', sequenceNumber: 3, timestamp: 300, durationMs: 1000, sampleRate: 16000, channels: 1, samples: new Float32Array(10) };

    queue.enqueue(c1);
    queue.enqueue(c2);
    expect(queue.isFull()).toBe(true);

    // Overflows -> drops c1
    queue.enqueue(c3);
    expect(queue.size()).toBe(2);
    expect(queue.peek()?.id).toBe('c2');
    expect(queue.getMetrics().droppedChunks).toBe(1);
  });

  it('should throw AudioQueueFullError when strategy is REJECT', () => {
    const queue = new AudioChunkQueue(1, 'REJECT');
    const c1: AudioChunk = { id: 'c1', sequenceNumber: 1, timestamp: 100, durationMs: 1000, sampleRate: 16000, channels: 1, samples: new Float32Array(10) };
    const c2: AudioChunk = { id: 'c2', sequenceNumber: 2, timestamp: 200, durationMs: 1000, sampleRate: 16000, channels: 1, samples: new Float32Array(10) };

    queue.enqueue(c1);
    expect(() => queue.enqueue(c2)).toThrow(AudioQueueFullError);
    expect(queue.getMetrics().rejectedChunks).toBe(1);
  });
});
