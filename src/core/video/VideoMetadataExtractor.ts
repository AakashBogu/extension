import { DiscoveredVideoMetadata } from './VideoTypes';
import { MetadataError } from '../error/VideoDiscoveryErrors';

export class VideoMetadataExtractor {
  extractMetadata(videoEl: HTMLVideoElement, isShadowDom: boolean = false): DiscoveredVideoMetadata {
    if (!videoEl) {
      throw new MetadataError('Invalid video element');
    }

    const extensibleEl = videoEl as HTMLVideoElement & { _factcheck_vid_?: string };
    const id = extensibleEl._factcheck_vid_ || `vid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    extensibleEl._factcheck_vid_ = id;

    return {
      id,
      src: videoEl.src || '',
      currentSrc: videoEl.currentSrc || videoEl.src || '',
      poster: videoEl.poster || '',
      width: videoEl.width || videoEl.clientWidth || 0,
      height: videoEl.height || videoEl.clientHeight || 0,
      readyState: videoEl.readyState || 0,
      networkState: videoEl.networkState || 0,
      preload: videoEl.preload || 'auto',
      autoplay: videoEl.autoplay || false,
      loop: videoEl.loop || false,
      muted: videoEl.muted || false,
      controls: videoEl.controls || false,
      crossOrigin: videoEl.crossOrigin || null,
      discoveredAt: Date.now(),
      isShadowDom
    };
  }
}
