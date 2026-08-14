import { AudioTrackMetadata } from './TabAudioCaptureTypes';
import { TabCaptureStreamError } from '../../error/TabCaptureErrors';

export class TabCaptureStreamManager {
  private activeStreams = new Map<string, MediaStream>();
  private trackEndedCallbacks = new Map<string, (trackId: string) => void>();

  registerStream(sessionId: string, stream: MediaStream, onTrackEnded?: (trackId: string) => void): AudioTrackMetadata[] {
    if (!stream) throw new TabCaptureStreamError('MediaStream cannot be null');

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      throw new TabCaptureStreamError('MediaStream contains no audio tracks');
    }

    this.activeStreams.set(sessionId, stream);

    if (onTrackEnded) {
      this.trackEndedCallbacks.set(sessionId, onTrackEnded);
    }

    const metadataList: AudioTrackMetadata[] = [];

    audioTracks.forEach(track => {
      metadataList.push({
        id: track.id,
        kind: track.kind,
        label: track.label || 'Tab Audio Track',
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState
      });

      track.onended = () => {
        const callback = this.trackEndedCallbacks.get(sessionId);
        if (callback) callback(track.id);
      };
    });

    return metadataList;
  }

  getStream(sessionId: string): MediaStream | undefined {
    return this.activeStreams.get(sessionId);
  }

  releaseStream(sessionId: string): void {
    const stream = this.activeStreams.get(sessionId);
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        track.onended = null;
      });
      this.activeStreams.delete(sessionId);
      this.trackEndedCallbacks.delete(sessionId);
    }
  }

  clear(): void {
    this.activeStreams.forEach(stream => {
      stream.getTracks().forEach(t => t.stop());
    });
    this.activeStreams.clear();
    this.trackEndedCallbacks.clear();
  }
}
