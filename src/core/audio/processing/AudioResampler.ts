import { ResamplingError } from '../../error/AudioProcessingErrors';

export class AudioResampler {
  private remainderOffset = 0;

  resample(input: Float32Array, inputRate: number, targetRate: number = 16000): Float32Array {
    if (inputRate <= 0 || targetRate <= 0) {
      throw new ResamplingError(inputRate, targetRate, 'Sample rates must be positive integers');
    }

    if (!input || input.length === 0) {
      return new Float32Array(0);
    }

    if (inputRate === targetRate) {
      return input;
    }

    const ratio = inputRate / targetRate;
    const outputLength = Math.floor((input.length - this.remainderOffset) / ratio);

    if (outputLength <= 0) {
      return new Float32Array(0);
    }

    const output = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const pos = this.remainderOffset + i * ratio;
      const index = Math.floor(pos);
      const frac = pos - index;

      if (index + 1 < input.length) {
        output[i] = input[index] + frac * (input[index + 1] - input[index]);
      } else if (index < input.length) {
        output[i] = input[index];
      } else {
        output[i] = 0.0;
      }
    }

    const nextOffset = (this.remainderOffset + outputLength * ratio) - input.length;
    this.remainderOffset = Math.max(0, nextOffset);

    return output;
  }

  reset(): void {
    this.remainderOffset = 0;
  }
}
