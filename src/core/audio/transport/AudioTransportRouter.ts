import { AudioChunk } from '../processing/AudioProcessingTypes';
import { TransportDestination } from './AudioTransportTypes';

export class AudioTransportRouter {
  private destination: TransportDestination = 'SPEECH_PIPELINE';

  setDestination(destination: TransportDestination): void {
    this.destination = destination;
  }

  getDestination(): TransportDestination {
    return this.destination;
  }

  routeChunk(chunk: AudioChunk): { target: TransportDestination; chunk: AudioChunk } {
    return { target: this.destination, chunk };
  }
}
