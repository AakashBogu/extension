export type OffscreenDocumentStatus =
  | 'UNAVAILABLE'
  | 'CREATING'
  | 'CREATED'
  | 'INITIALIZING'
  | 'READY'
  | 'STOPPING'
  | 'DESTROYED'
  | 'ERROR'
  | 'RECOVERING';

export type AudioContextState = 'suspended' | 'running' | 'closed';

export type OffscreenMessageType =
  | 'OFFSCREEN_INIT'
  | 'OFFSCREEN_START'
  | 'OFFSCREEN_STOP'
  | 'OFFSCREEN_SUSPEND'
  | 'OFFSCREEN_RESUME'
  | 'OFFSCREEN_STATUS_REQUEST'
  | 'OFFSCREEN_STATUS_RESPONSE'
  | 'OFFSCREEN_HEALTH_REQUEST'
  | 'OFFSCREEN_HEALTH_RESPONSE'
  | 'OFFSCREEN_ERROR'
  | 'OFFSCREEN_READY'
  | 'OFFSCREEN_DESTROY'
  | 'OFFSCREEN_HEARTBEAT';

export interface OffscreenMessage<T = unknown> {
  messageId: string;
  type: OffscreenMessageType;
  timestamp: number;
  source: 'service-worker' | 'offscreen-document';
  target: 'service-worker' | 'offscreen-document';
  correlationId: string;
  payload: T;
  version: string;
}

export interface OffscreenCapabilities {
  offscreenApiAvailable: boolean;
  audioContextAvailable: boolean;
  audioWorkletAvailable: boolean;
  webAudioAvailable: boolean;
  chromeMessagingAvailable: boolean;
  permissions: {
    offscreen: boolean;
    tabCapture: boolean;
    storage: boolean;
  };
}

export interface OffscreenRuntimeConfig {
  heartbeatIntervalMs: number;
  messageTimeoutMs: number;
  initializationTimeoutMs: number;
  maxRecoveryAttempts: number;
  recoveryBackoffMs: number;
  recoveryCooldownMs: number;
  healthCheckIntervalMs: number;
  debugMode: boolean;
}
