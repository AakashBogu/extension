export class VideoLocator {
  locateVideos(root?: Document | Element, scanShadowDom: boolean = true): HTMLVideoElement[] {
    if (typeof document === 'undefined' && !root) return [];

    const targetRoot = root || (typeof document !== 'undefined' ? document : null);
    if (!targetRoot) return [];

    const videos: HTMLVideoElement[] = [];
    const elements = Array.from(targetRoot.querySelectorAll('video')) as HTMLVideoElement[];
    videos.push(...elements);

    if (scanShadowDom) {
      this.scanShadowRoots(targetRoot, videos);
    }

    return videos;
  }

  private scanShadowRoots(node: Document | Element, accumulator: HTMLVideoElement[]): void {
    const allElements = Array.from(node.querySelectorAll('*'));
    for (const el of allElements) {
      if (el.shadowRoot) {
        const shadowVideos = Array.from(el.shadowRoot.querySelectorAll('video')) as HTMLVideoElement[];
        accumulator.push(...shadowVideos);
        this.scanShadowRoots(el.shadowRoot as unknown as Element, accumulator);
      }
    }
  }
}
