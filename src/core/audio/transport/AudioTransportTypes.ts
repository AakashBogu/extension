import { AudioChunk, SpeechSegment } from '../processing/AudioProcessingTypes';

export type AudioTransportStatus =
  | 'IDLE'
  | 'INITIALIZING'
  | 'READY'
  | 'RUNNING'
  | 'PAUSED'
  | 'DRAINING'
  | 'STOPPED'
  | 'ERROR'
  | 'RECOVERING'
  | 'DESTROYED';

export type BackpressureDropStrategy = 'DROP_OLDEST' | 'DROP_NEWEST' | 'REJECT';

export type TransportDestination = 'SPEECH_PIPELINE' | 'DEBUG' | 'ARCHIVE' | 'ANALYTICS';

export interface SerializedAudioChunk {
  id: string;
  sequenceNumber: number;
  timestamp: number;
  durationMs: number;
  sampleRate: number;
  channels: number;
  sampleBuffer: ArrayBuffer;
}

export interface QueueMetrics {
  size: number;
  capacity: number;
  utilizationPercent: number;
  droppedChunks: number;
  rejectedChunks: number;
  averageLatencyMs: number;
}

export interface AudioTransportMetrics {
  receivedChunks: number;
  queuedChunks: number;
  deliveredChunks: number;
  droppedChunks: number;
  rejectedChunks: number;
  sequenceGaps: number;
  duplicates: number;
  outOfOrder: number;
  averageQueueDepth: number;
  maxQueueDepth: number;
  averageDeliveryLatencyMs: number;
  maxDeliveryLatencyMs: number;
  retryCount: number;
  adapterFailures: number;
}

export interface AudioTransportHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  queueSaturationPercent: number;
  droppedChunksCount: number;
  adapterHealthy: boolean;
  lastError?: string;
  details: Record<string, unknown>;
}

export interface SpeechPipelineHealth {
  ready: boolean;
  adapterName: string;
  processedChunksCount: number;
  lastProcessedAt: number;
}

export interface AudioTransportConfig {
  enabled: boolean;
  maxQueueSize: number;
  dropStrategy: BackpressureDropStrategy;
  backpressureThresholdPercent: number;
  retry: {
    maxRetries: number;
    retryDelayMs: number;
    maxRetryDelayMs: number;
    processingTimeoutMs: number;
  };
}

export interface ISpeechPipelineAdapter {
  name: string;
  initialize(): Promise<void>;
  acceptAudioChunk(chunk: AudioChunk): Promise<void>;
  acceptSpeechSegment(segment: SpeechSegment): Promise<void>;
  flush(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  healthCheck(): Promise<SpeechPipelineHealth>;
  destroy(): void;
}
