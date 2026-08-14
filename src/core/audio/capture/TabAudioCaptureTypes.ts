export type TabCaptureStatus =
  | 'IDLE'
  | 'REQUESTING'
  | 'STARTING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'STOPPING'
  | 'STOPPED'
  | 'ERROR'
  | 'RECOVERING'
  | 'DESTROYED';

export interface AudioTrackMetadata {
  id: string;
  kind: string;
  label: string;
  enabled: boolean;
  muted: boolean;
  readyState: string;
}

export interface TabCaptureSessionRecord {
  sessionId: string;
  tabId: number;
  createdAt: number;
  startedAt: number;
  stoppedAt?: number;
  status: TabCaptureStatus;
  streamId?: string;
  audioTrackCount: number;
  error?: string;
  source: string;
  correlationId: string;
}

export interface TabCaptureCapabilities {
  tabCaptureApiAvailable: boolean;
  mediaStreamAvailable: boolean;
  mediaTrackAvailable: boolean;
  audioContextAvailable: boolean;
  offscreenRuntimeAvailable: boolean;
  hasTabCapturePermission: boolean;
}

export interface TabCaptureConfig {
  captureEnabled: boolean;
  autoRecovery: boolean;
  maxRecoveryAttempts: number;
  recoveryBackoffMs: number;
  healthCheckIntervalMs: number;
  requestTimeoutMs: number;
  trackMonitoringEnabled: boolean;
}
