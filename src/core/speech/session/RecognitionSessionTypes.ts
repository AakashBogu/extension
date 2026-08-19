export type RecognitionSessionStatus =
  | 'IDLE'
  | 'STARTING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'STOPPING'
  | 'STOPPED'
  | 'ERROR';

export interface RecognitionSessionRecord {
  sessionId: string;
  tabId: number;
  videoId?: string;
  createdAt: number;
  startedAt: number;
  stoppedAt?: number;
  status: RecognitionSessionStatus;
  providerId: string;
  language: string;
  correlationId: string;
}
