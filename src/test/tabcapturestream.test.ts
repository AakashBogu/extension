import { describe, it, expect } from 'vitest';
import { TabCaptureStreamManager } from '../core/audio/capture/TabCaptureStreamManager';
import { TabCaptureStreamError } from '../core/error/TabCaptureErrors';

describe('Module 3B: TabCaptureStreamManager', () => {
  it('should reject null streams or streams without audio tracks', () => {
    const manager = new TabCaptureStreamManager();
    expect(() => manager.registerStream('s1', null as unknown as MediaStream)).toThrow(TabCaptureStreamError);

    const emptyStream = {
      getAudioTracks: () => []
    } as unknown as MediaStream;

    expect(() => manager.registerStream('s1', emptyStream)).toThrow(TabCaptureStreamError);
  });

  it('should register valid MediaStream audio tracks cleanly', () => {
    const manager = new TabCaptureStreamManager();
    const mockTrack = {
      id: 'track_1',
      kind: 'audio',
      label: 'Tab Audio',
      enabled: true,
      muted: false,
      readyState: 'live',
      stop: () => {}
    };

    const mockStream = {
      getAudioTracks: () => [mockTrack],
      getTracks: () => [mockTrack]
    } as unknown as MediaStream;

    const tracks = manager.registerStream('s100', mockStream);
    expect(tracks.length).toBe(1);
    expect(tracks[0].kind).toBe('audio');

    manager.releaseStream('s100');
    expect(manager.getStream('s100')).toBeUndefined();
  });
});
