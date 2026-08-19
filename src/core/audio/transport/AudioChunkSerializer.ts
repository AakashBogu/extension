import { AudioChunk } from '../processing/AudioProcessingTypes';
import { SerializedAudioChunk } from './AudioTransportTypes';
import { AudioTransportValidationError } from '../../error/AudioTransportErrors';

export class AudioChunkSerializer {
  serialize(chunk: AudioChunk): SerializedAudioChunk {
    if (!chunk || !chunk.samples) {
      throw new AudioTransportValidationError('chunk', 'Cannot serialize invalid chunk');
    }

    const buffer = chunk.samples.buffer as ArrayBuffer;
    return {
      id: chunk.id,
      sequenceNumber: chunk.sequenceNumber,
      timestamp: chunk.timestamp,
      durationMs: chunk.durationMs,
      sampleRate: chunk.sampleRate,
      channels: chunk.channels,
      sampleBuffer: buffer.slice(chunk.samples.byteOffset, chunk.samples.byteOffset + chunk.samples.byteLength)
    };
  }

  deserialize(serialized: SerializedAudioChunk): AudioChunk {
    if (!serialized || !serialized.sampleBuffer) {
      throw new AudioTransportValidationError('serialized', 'Cannot deserialize invalid payload');
    }

    return {
      id: serialized.id,
      sequenceNumber: serialized.sequenceNumber,
      timestamp: serialized.timestamp,
      durationMs: serialized.durationMs,
      sampleRate: serialized.sampleRate,
      channels: serialized.channels,
      samples: new Float32Array(serialized.sampleBuffer)
    };
  }

  validate(serialized: SerializedAudioChunk): boolean {
    return !!(serialized && serialized.id && serialized.sequenceNumber > 0 && serialized.sampleBuffer);
  }
}
