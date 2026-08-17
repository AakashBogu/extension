import { ChannelMixMode } from './AudioProcessingTypes';

export class ChannelMixer {
  mixToMono(channels: Float32Array[], mode: ChannelMixMode = 'MONO_AVERAGE'): Float32Array {
    if (!channels || channels.length === 0) return new Float32Array(0);

    if (channels.length === 1 && mode === 'MONO_AVERAGE') {
      return channels[0];
    }

    const length = channels[0].length;
    const mono = new Float32Array(length);

    if (mode === 'LEFT') {
      return channels[0];
    }

    if (mode === 'RIGHT') {
      return channels.length > 1 ? channels[1] : channels[0];
    }

    if (mode === 'MAX_ENERGY') {
      for (let i = 0; i < length; i++) {
        let maxVal = 0;
        for (let c = 0; c < channels.length; c++) {
          const val = channels[c][i];
          if (Math.abs(val) > Math.abs(maxVal)) {
            maxVal = val;
          }
        }
        mono[i] = maxVal;
      }
      return mono;
    }

    // MONO_AVERAGE default
    const channelCount = channels.length;
    for (let i = 0; i < length; i++) {
      let sum = 0;
      for (let c = 0; c < channelCount; c++) {
        sum += channels[c][i];
      }
      mono[i] = Math.max(-1.0, Math.min(1.0, sum / channelCount));
    }

    return mono;
  }
}
