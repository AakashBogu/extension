export type VideoLifecycleState =
  | 'UNKNOWN'
  | 'DISCOVERED'
  | 'METADATA_LOADING'
  | 'METADATA_READY'
  | 'READY'
  | 'CAN_PLAY'
  | 'PLAYING'
  | 'PAUSED'
  | 'BUFFERING'
  | 'SEEKING'
  | 'WAITING'
  | 'STALLED'
  | 'ENDED'
  | 'DESTROYED';

export interface LifecycleTransition {
  from: VideoLifecycleState;
  to: VideoLifecycleState;
  timestamp: number;
  eventName: string;
}

export interface VideoLifecycleEntry {
  videoId: string;
  currentState: VideoLifecycleState;
  previousState: VideoLifecycleState;
  history: LifecycleTransition[];
  lastEvent: string;
  lastError?: string;
}

export interface LifecycleConfig {
  validateTransitions: boolean;
  maxHistorySize: number;
  enableLifecycleLogging: boolean;
}
