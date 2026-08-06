import { describe, it, expect } from 'vitest';
import { VideoStateResolver } from '../core/video/lifecycle/VideoStateResolver';

describe('Module 2C: VideoStateResolver', () => {
  it('should resolve HTML5 video DOM media events to lifecycle states correctly', () => {
    const resolver = new VideoStateResolver();

    expect(resolver.resolveStateFromEvent('loadstart')).toBe('METADATA_LOADING');
    expect(resolver.resolveStateFromEvent('loadedmetadata')).toBe('METADATA_READY');
    expect(resolver.resolveStateFromEvent('play')).toBe('PLAYING');
    expect(resolver.resolveStateFromEvent('pause')).toBe('PAUSED');
    expect(resolver.resolveStateFromEvent('waiting')).toBe('WAITING');
    expect(resolver.resolveStateFromEvent('ended')).toBe('ENDED');
    expect(resolver.resolveStateFromEvent('unknown_event')).toBeNull();
  });
});
