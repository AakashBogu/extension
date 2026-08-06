export type MutationCallback = (addedVideos: HTMLVideoElement[], removedVideos: HTMLVideoElement[]) => void;

export class VideoObserver {
  private observer: MutationObserver | null = null;
  private isObserving = false;

  startObserving(targetNode: Node = document.body, callback: MutationCallback): void {
    if (typeof MutationObserver === 'undefined' || this.isObserving) return;

    this.observer = new MutationObserver((mutations) => {
      const addedVideos: HTMLVideoElement[] = [];
      const removedVideos: HTMLVideoElement[] = [];

      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            if (node.tagName === 'VIDEO') {
              addedVideos.push(node as HTMLVideoElement);
            }
            const nested = Array.from(node.querySelectorAll('video')) as HTMLVideoElement[];
            addedVideos.push(...nested);
          }
        });

        mutation.removedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            if (node.tagName === 'VIDEO') {
              removedVideos.push(node as HTMLVideoElement);
            }
            const nested = Array.from(node.querySelectorAll('video')) as HTMLVideoElement[];
            removedVideos.push(...nested);
          }
        });
      }

      if (addedVideos.length > 0 || removedVideos.length > 0) {
        callback(addedVideos, removedVideos);
      }
    });

    this.observer.observe(targetNode, {
      childList: true,
      subtree: true
    });
    this.isObserving = true;
  }

  stopObserving(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isObserving = false;
  }
}
