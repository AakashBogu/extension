export class InteractionTracker {
  private interactionMap = new Map<string, number>();

  recordInteraction(videoId: string): void {
    this.interactionMap.set(videoId, Date.now());
  }

  getLastInteractedAt(videoId: string): number {
    return this.interactionMap.get(videoId) || 0;
  }
}
