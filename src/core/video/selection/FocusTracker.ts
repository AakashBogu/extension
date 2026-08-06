export class FocusTracker {
  private focusedVideoId: string | null = null;

  setFocusedVideo(videoId: string | null): void {
    this.focusedVideoId = videoId;
  }

  isFocused(videoId: string): boolean {
    return this.focusedVideoId === videoId;
  }

  getFocusedVideoId(): string | null {
    return this.focusedVideoId;
  }
}
