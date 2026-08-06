import { CandidateScore } from './SelectionTypes';

export class ActiveVideoSelector {
  private pinnedVideoId: string | null = null;

  selectBestCandidate(scores: CandidateScore[]): CandidateScore | undefined {
    if (scores.length === 0) return undefined;

    if (this.pinnedVideoId) {
      const pinned = scores.find(s => s.videoId === this.pinnedVideoId);
      if (pinned) return pinned;
    }

    const sorted = [...scores].sort((a, b) => b.score - a.score);
    return sorted[0];
  }

  pinVideo(videoId: string): void {
    this.pinnedVideoId = videoId;
  }

  unpinVideo(): void {
    this.pinnedVideoId = null;
  }

  getPinnedVideoId(): string | null {
    return this.pinnedVideoId;
  }
}
