import { ViewportObserver, VisibilityCallback } from './ViewportObserver';

export class VisibilityTracker {
  private observer = new ViewportObserver();
  private visibilityRatios = new Map<string, number>();

  trackVisibility(videoId: string, element: Element, onUpdate?: VisibilityCallback): void {
    this.observer.observe(videoId, element, (vId, ratio) => {
      this.visibilityRatios.set(vId, ratio);
      if (onUpdate) onUpdate(vId, ratio);
    });
  }

  stopTracking(element: Element, videoId: string): void {
    this.observer.unobserve(element);
    this.visibilityRatios.delete(videoId);
  }

  getVisibilityRatio(videoId: string): number {
    return this.visibilityRatios.get(videoId) || 0;
  }
}
