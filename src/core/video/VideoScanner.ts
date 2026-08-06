import { VideoLocator } from './VideoLocator';
import { VideoMetadataExtractor } from './VideoMetadataExtractor';
import { VideoRegistry } from './VideoRegistry';

export class VideoScanner {
  constructor(
    private locator: VideoLocator,
    private extractor: VideoMetadataExtractor,
    private registry: VideoRegistry
  ) {}

  scan(root: Document | Element = document, scanShadowDom: boolean = true): number {
    const videoElements = this.locator.locateVideos(root, scanShadowDom);
    let count = 0;

    videoElements.forEach(el => {
      const meta = this.extractor.extractMetadata(el);
      this.registry.registerVideo(el, meta);
      count++;
    });

    return count;
  }
}
