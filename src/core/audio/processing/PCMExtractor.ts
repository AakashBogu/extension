import { PCMExtractionError } from '../../error/AudioProcessingErrors';

export class PCMExtractor {
  extractPCM(channelBuffers: Float32Array[]): Float32Array[] {
    if (!channelBuffers || channelBuffers.length === 0) {
      throw new PCMExtractionError('Channel buffers array is empty or undefined');
    }

    const sanitizedChannels: Float32Array[] = [];

    for (let c = 0; c < channelBuffers.length; c++) {
      const src = channelBuffers[c];
      if (!src || src.length === 0) {
        sanitizedChannels.push(new Float32Array(0));
        continue;
      }

      const clean = new Float32Array(src.length);
      for (let i = 0; i < src.length; i++) {
        const val = src[i];
        if (Number.isNaN(val) || !Number.isFinite(val)) {
          clean[i] = 0.0;
        } else {
          clean[i] = Math.max(-1.0, Math.min(1.0, val));
        }
      }
      sanitizedChannels.push(clean);
    }

    return sanitizedChannels;
  }
}
