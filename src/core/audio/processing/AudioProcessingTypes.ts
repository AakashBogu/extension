export type ChannelMixMode = 'MONO_AVERAGE' | 'LEFT' | 'RIGHT' | 'MAX_ENERGY';

export type VADState = 'SILENCE' | 'POSSIBLE_SPEECH' | 'SPEECH' | 'POSSIBLE_SILENCE';

export type AudioProcessingLifecycleStatus =
  | 'CREATED'
  | 'INITIALIZING'
  | 'READY'
  | 'RUNNING'
  | 'PAUSED'
  | 'STOPPING'
  | 'STOPPED'
  | 'DESTROYED';

export interface AudioFrame {
  id: string;
  sequenceNumber: number;
  timestamp: number;
  durationMs: number;
  sampleRate: number;
  channels: number;
  samples: Float32Array;
}

export interface AudioFrameMetadata {
  id: string;
  sequenceNumber: number;
  timestamp: number;
  durationMs: number;
  sampleRate: number;
  channels: number;
  sampleLength: number;
}

export interface AudioChunk {
  id: string;
  sequenceNumber: number;
  timestamp: number;
  durationMs: number;
  sampleRate: number;
  channels: number;
  samples: Float32Array;
}

export interface AudioSignalMetrics {
  rms: number;
  peak: number;
  zeroCrossingRate: number;
  decibels: number;
  timestamp: number;
}

export interface NoiseFloorState {
  levelDb: number;
  confidence: number;
  lastUpdatedAt: number;
}

export interface SpeechSegment {
  id: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  frameCount: number;
  confidence: number;
  sequenceStart: number;
  sequenceEnd?: number;
}

export interface AudioProcessingMetrics {
  processedFrames: number;
  processedChunks: number;
  droppedFrames: number;
  droppedChunks: number;
  averageProcessingTimeMs: number;
  maxProcessingTimeMs: number;
  averageFrameLatencyMs: number;
  currentBufferDepth: number;
  speechSegmentsDetected: number;
  totalSpeechDurationMs: number;
}

export interface VADConfig {
  enabled: boolean;
  speechThresholdDb: number;
  silenceThresholdDb: number;
  speechStartFrames: number;
  silenceHangoverMs: number;
  minSpeechDurationMs: number;
}

export interface AudioProcessingConfig {
  enabled: boolean;
  targetSampleRate: number;
  channelMode: ChannelMixMode;
  frameDurationMs: number;
  chunkDurationMs: number;
  maxPendingFrames: number;
  maxPendingChunks: number;
  vad: VADConfig;
}

export interface IAudioProcessingOutput {
  onFrame(frame: AudioFrame): void;
  onChunk(chunk: AudioChunk): void;
  onSpeechSegment(segment: SpeechSegment): void;
}
