export interface TranscriptWord {
  word: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

export interface SpeakerInfo {
  speakerId: string;
  label: string;
  confidence: number;
}

export interface RecognitionResult {
  id: string;
  sessionId: string;
  providerId: string;
  timestamp: number;
  sequenceNumber: number;
  isFinal: boolean;
  confidence: number;
  language: string;
  text: string;
  startTime: number;
  endTime: number;
  words?: TranscriptWord[];
  speaker?: SpeakerInfo;
}

export interface TranscriptSegmentRecord {
  segmentId: string;
  sessionId: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
  language: string;
  providerId: string;
  sequenceNumber: number;
  createdAt: number;
  isFinal: boolean;
  words?: TranscriptWord[];
  speaker?: SpeakerInfo;
}

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
