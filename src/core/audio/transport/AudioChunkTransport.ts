import { AudioChunk } from '../processing/AudioProcessingTypes';
import { AudioTransportValidationError } from '../../error/AudioTransportErrors';

export class AudioChunkTransport {
  private lastSequenceNumber = 0;

  validateChunk(chunk: AudioChunk): boolean {
    if (!chunk || typeof chunk !== 'object') {
      throw new AudioTransportValidationError('chunk', 'Chunk object is null or undefined');
    }

    if (!chunk.id || typeof chunk.id !== 'string') {
      throw new AudioTransportValidationError('id', 'Invalid or missing chunk ID');
    }

    if (!chunk.sequenceNumber || chunk.sequenceNumber <= 0) {
      throw new AudioTransportValidationError('sequenceNumber', 'Sequence number must be a positive integer');
    }

    if (!chunk.timestamp || chunk.timestamp <= 0) {
      throw new AudioTransportValidationError('timestamp', 'Timestamp must be positive');
    }

    if (!chunk.sampleRate || chunk.sampleRate <= 0) {
      throw new AudioTransportValidationError('sampleRate', 'Sample rate must be positive');
    }

    if (!chunk.durationMs || chunk.durationMs <= 0) {
      throw new AudioTransportValidationError('durationMs', 'Duration must be positive');
    }

    if (!chunk.samples || !(chunk.samples instanceof Float32Array) || chunk.samples.length === 0) {
      throw new AudioTransportValidationError('samples', 'Samples must be a non-empty Float32Array');
    }

    for (let i = 0; i < chunk.samples.length; i++) {
      const val = chunk.samples[i];
      if (Number.isNaN(val) || !Number.isFinite(val)) {
        throw new AudioTransportValidationError('samples', 'Sample buffer contains NaN or Infinity');
      }
    }

    return true;
  }

  processSequenceNumber(sequenceNumber: number): { isDuplicate: boolean; isGap: boolean; isOutOfOrder: boolean } {
    let isDuplicate = false;
    let isGap = false;
    let isOutOfOrder = false;

    if (sequenceNumber <= this.lastSequenceNumber) {
      isDuplicate = true;
      isOutOfOrder = true;
    } else if (this.lastSequenceNumber > 0 && sequenceNumber > this.lastSequenceNumber + 1) {
      isGap = true;
    }

    if (!isDuplicate) {
      this.lastSequenceNumber = Math.max(this.lastSequenceNumber, sequenceNumber);
    }

    return { isDuplicate, isGap, isOutOfOrder };
  }

  resetSequence(): void {
    this.lastSequenceNumber = 0;
  }
}
