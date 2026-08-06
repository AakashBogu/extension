import { AppState } from './IAppState';
import { AppConfig } from '../config/IConfig';

export interface UIState {
  theme: 'dark' | 'light';
  overlayVisible: boolean;
  activeTab: string;
}

export interface OverlayState {
  position: { x: number; y: number };
  opacity: number;
}

export interface ProvidersState {
  activeAiProvider: string;
  activeSearchProvider: string;
}

export interface PluginsState {
  registeredCount: number;
  activeCount: number;
}

export interface DiagnosticsState {
  errorCount: number;
  lastDiagnosticAt: number | null;
}

export interface RuntimeState {
  version: string;
  env: string;
  isRunning: boolean;
  startedAt: number | null;
}

// Placeholder interfaces for future modules
export interface VideoSliceState extends Record<string, unknown> {}
export interface AudioSliceState extends Record<string, unknown> {}
export interface TranscriptSliceState extends Record<string, unknown> {}
export interface ClaimsSliceState extends Record<string, unknown> {}
export interface VerificationSliceState extends Record<string, unknown> {}
export interface TimelineSliceState extends Record<string, unknown> {}
export interface DebugSliceState extends Record<string, unknown> {}

export interface GlobalState {
  application: AppState;
  runtime: RuntimeState;
  configuration: AppConfig;
  ui: UIState;
  overlay: OverlayState;
  providers: ProvidersState;
  plugins: PluginsState;
  diagnostics: DiagnosticsState;
  // Future module placeholders
  video: VideoSliceState;
  audio: AudioSliceState;
  transcript: TranscriptSliceState;
  claims: ClaimsSliceState;
  verification: VerificationSliceState;
  timeline: TimelineSliceState;
  debug: DebugSliceState;
}

export interface StateSnapshot {
  id: string;
  timestamp: number;
  version: number;
  state: GlobalState;
}

export interface StateDiff {
  changedKeys: string[];
  oldState: Partial<GlobalState>;
  newState: Partial<GlobalState>;
}
