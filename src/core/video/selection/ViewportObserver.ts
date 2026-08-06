export type VisibilityCallback = (videoId: string, visibilityRatio: number) => void;

export class ViewportObserver {
  private observer: IntersectionObserver | null = null;
  private targetMap = new Map<Element, string>();

  observe(videoId: string, element: Element, callback: VisibilityCallback): void {
    if (typeof IntersectionObserver === 'undefined') {
      callback(videoId, 1.0); // Fallback for environments without IntersectionObserver
      return;
    }

    if (!this.observer) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const vId = this.targetMap.get(entry.target);
          if (vId) {
            callback(vId, entry.intersectionRatio);
          }
        });
      }, { threshold: [0, 0.25, 0.5, 0.75, 1.0] });
    }

    this.targetMap.set(element, videoId);
    this.observer.observe(element);
  }

  unobserve(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element);
      this.targetMap.delete(element);
    }
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      this.targetMap.clear();
    }
  }
}
