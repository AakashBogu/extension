# Provider-Agnostic Speech Recognition Pipeline - Interfaces & Type Contracts

```typescript
export interface FinalizedTranscript {
  transcriptId: string;
  sessionId: string;
  videoId?: string;
  language: string;
  segments: TranscriptSegmentRecord[];
  fullText: string;
  startTime: number;
  endTime: number;
  averageConfidence: number;
  providerId: string;
  createdAt: number;
}
```
